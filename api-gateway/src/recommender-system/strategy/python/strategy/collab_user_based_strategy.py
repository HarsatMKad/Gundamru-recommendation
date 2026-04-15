import pandas as pd
import numpy as np
from datetime import datetime
from typing import List
from sklearn.metrics.pairwise import cosine_similarity
from util.services import calculate_confidences, calculate_time_weight, normalize_scores
from util.classes import Event, Product
from config import (
    MIN_SIMILARITY_THRESHOLD,
    MIN_PRODUCT_FOR_USER,
    PRICE_PERCENTAGE_RANGE,
    PRICE_COEFFICIENT,
    INTERACTION_SENSITIVITY_COEFFICIENT,
    STD_EPSILON
    )

def collab_user_based(rec_length: int, events: List[Event], products: List[Product]):
    events = [e for e in events if e.weight > 0]

    if not events or not products:
        return {}

    event_of_dicts = [e.model_dump() for e in events] 
    df = pd.DataFrame(event_of_dicts)

    # добавляем цену товара к событиям
    products_df = pd.DataFrame([p.model_dump() for p in products])
    price_map = dict(zip(products_df['id'], products_df['price']))
    median_price = products_df['price'].median()
    df['price'] = df['product_id'].map(price_map).fillna(median_price)

    product_prices_mean = df.groupby('product_id')['price'].mean()
    global_avg_price = df['price'].mean()
    user_median_prices = df.groupby('user_id')['price'].median()

    # исключаем неуверенных пользователей, у которых мало событий
    user_unique_products = df.groupby('user_id')['product_id'].nunique()
    valid_users = user_unique_products[user_unique_products > MIN_PRODUCT_FOR_USER].index
    
    df = df[df['user_id'].isin(valid_users)]

    if df.empty:
        return {}

    # расчет финальных весов событий, учитывающих вес события, количество этого события и его актуальность
    current_time_ms = datetime.now().timestamp() * 1000
    df['final_weight'] = df.apply(
        lambda row: row['weight'] *
            row['count'] *
            calculate_time_weight(current_time_ms, row['timestamp'], row['retention_days']),
        axis=1
    )
    
    pivot = df.pivot_table(
        index='user_id', 
        columns='product_id', 
        values='final_weight', 
        fill_value=0,
        aggfunc='sum'
    )
    
    pivot_matrix = pivot.values
    user_ids = pivot.index.values
    product_ids = pivot.columns.values
    
    # Центрирование данных для косинусного сходства
    user_means = np.zeros(pivot_matrix.shape[0])
    for i in range(pivot_matrix.shape[0]):
        row = pivot_matrix[i]
        non_zero = row[row > 0]
        user_means[i] = non_zero.mean() if len(non_zero) > 0 else 0
    
    pivot_centered = pivot_matrix - user_means.reshape(-1, 1)
    pivot_centered[pivot_matrix == 0] = 0
    
    # Расчет сходства пользователей
    user_sim = cosine_similarity(pivot_centered)
    user_sim[user_sim < MIN_SIMILARITY_THRESHOLD] = 0
    np.fill_diagonal(user_sim, 1.0)

    # Нормализация матрицы сходства
    sim_sum = user_sim.sum(axis=1, keepdims=True)
    sim_sum[sim_sum == 0] = 1
    user_sim_norm = user_sim / sim_sum

    # Генерация предсказаний
    predictions_centered = user_sim_norm @ pivot_centered
    predictions = predictions_centered + user_means.reshape(-1, 1)
    
    # Формирование результатов для каждого пользователя
    results = {}
    for user_idx, user_id in enumerate(user_ids):
        user_preds = predictions[user_idx]

        # штраф к уже взаимодействованным товарам
        user_history_weights = pivot_matrix[user_idx]
        interaction_penaltys = np.exp(-INTERACTION_SENSITIVITY_COEFFICIENT * user_history_weights)
        interaction_penaltys[user_history_weights == 0] = 1.0
        user_preds *= interaction_penaltys

        # Проверка: есть ли кандидаты?
        valid_mask = ~np.isnan(user_preds)
        if not np.any(valid_mask):
            results[user_id] = []
            continue

        candidate_product_indices = np.where(valid_mask)[0]
        candidate_product_ids = product_ids[candidate_product_indices]

        raw_scores = user_preds[valid_mask]

        # Проверка: информативны ли предсказания?
        if np.std(raw_scores) < STD_EPSILON:
            results[user_id] = []
            continue

        # Проверка: достаточно ли уникальных рекомендаций?
        min_required = min(rec_length, 3)
        if len(np.unique(raw_scores)) < min_required:
            results[user_id] = []
            continue

        # Нормализация оценок 
        normalized_scores = normalize_scores(raw_scores, method='sigmoid')

        # Расчет доверия оценкам
        adjusted_confidences = calculate_confidences(raw_scores)

        # Применение бонуса предпочитаемой цены
        default_prices = product_prices_mean.reindex(product_ids, fill_value=global_avg_price)
        candidate_prices = default_prices.loc[candidate_product_ids].values
        
        # Бонус для товаров в ценовом диапазоне пользователя
        u_median = user_median_prices.get(user_id) 
        price_bonus = np.ones_like(raw_scores)
        if u_median is not None and not np.isnan(u_median):
            lower_bound = u_median * (1 - PRICE_PERCENTAGE_RANGE)
            upper_bound = u_median * (1 + PRICE_PERCENTAGE_RANGE)
            in_price_range_mask = (candidate_prices >= lower_bound) & (candidate_prices <= upper_bound)
            price_bonus[in_price_range_mask] = PRICE_COEFFICIENT
        
        final_scores = normalized_scores * adjusted_confidences * price_bonus
        top_indices_in_candidates = np.argsort(final_scores)[::-1][:rec_length]
        top_indices = candidate_product_indices[top_indices_in_candidates]

        results[user_id] = [
            {
                "sku": product_ids[idx],
                "score": float(normalized_scores[top_indices_in_candidates[i]]),
                "confidence": float(adjusted_confidences[top_indices_in_candidates[i]])
            }
            for i, idx in enumerate(top_indices)
        ]

    return results