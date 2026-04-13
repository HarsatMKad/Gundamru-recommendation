import json
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from typing import List
from util import calculate_confidences, calculate_time_weight, normalize_scores, validate_payload
from classes import Event, Product, StrategyPayload
from config import (
    MIN_PRODUCT_FOR_USER,
    INTERACTION_SENSITIVITY_COEFFICIENT,
    STD_EPSILON,
    CONTENT_BASED_WEIGHTS
)

def content_based(rec_length: int, events: List[Event], products: List[Product]):
    events_data = [e.model_dump() for e in events]
    df_events = pd.DataFrame(events_data)

    products_dict = {p.id: p for p in products}
    if not products_dict:
        return {}
    
    df_events['brand_id'] = df_events['product_id'].map(lambda pid: products_dict[pid].brand_id)
    df_events['grade'] = df_events['product_id'].map(lambda pid: products_dict[pid].grade)
    df_events['scale'] = df_events['product_id'].map(lambda pid: products_dict[pid].scale)
    df_events['price'] = df_events['product_id'].map(lambda pid: products_dict[pid].price)

    df_events = df_events.dropna(subset=['brand_id', 'grade', 'scale', 'price'])
    if df_events.empty:
        return {}
    
    current_time_ms = datetime.now().timestamp() * 1000
    df_events['final_weight'] = df_events.apply(
        lambda row: row['weight'] *
                    row['count'] *
                    calculate_time_weight(current_time_ms, row['timestamp'], row['retention_days']),
        axis=1
    )

    user_product_counts = df_events.groupby('user_id')['product_id'].nunique()
    valid_users = user_product_counts[user_product_counts > MIN_PRODUCT_FOR_USER].index
    df_events = df_events[df_events['user_id'].isin(valid_users)]
    if df_events.empty:
        return {}
    
    user_avg_price = df_events.groupby('user_id').apply(
        lambda g: np.average(g['price'], weights=g['final_weight'])
    ).to_dict()

    # формирование профилей пользователей
    user_profiles = {}
    for user_id, group in df_events.groupby('user_id'):
        profile = {
            'brand': {},
            'grade': {},
            'scale': {},
            'total_weight': 0.0
        }
        for _, row in group.iterrows():
            w = row['final_weight']
            profile['total_weight'] += w

            b = row['brand_id']
            if b:
                profile['brand'][b] = profile['brand'].get(b, 0.0) + w

            g = row['grade']
            if g:
                profile['grade'][g] = profile['grade'].get(g, 0.0) + w

            s = row['scale']
            if s:
                profile['scale'][s] = profile['scale'].get(s, 0.0) + w

        # нормализация весов признаков
        tw = profile['total_weight']
        if tw > 0:
            for cat in ['brand', 'grade', 'scale']:
                for val in profile[cat]:
                    profile[cat][val] /= tw

        user_profiles[user_id] = profile

    user_history = {}
    for user_id, group in df_events.groupby('user_id'):
        user_history[user_id] = dict(zip(group['product_id'], group['final_weight']))

    # Генерация рекомендаций
    results = {}
    all_product_ids = list(products_dict.keys())

    for user_id, profile in user_profiles.items():
        raw_scores = []
        valid_product_ids = []
        avg_price = user_avg_price.get(user_id, 0.0)

        for product_id in all_product_ids:
            product = products_dict[product_id]
            if not product.brand_id or not product.grade or not product.scale:
                continue

            brand_match = profile['brand'].get(product.brand_id, 0.0)
            grade_match = profile['grade'].get(product.grade, 0.0)
            scale_match = profile['scale'].get(product.scale, 0.0)

            if avg_price > 0 and product.price > 0:
                price_diff = abs(product.price - avg_price) / max(avg_price, product.price)
                price_sim = 1.0 - price_diff
            
            score = (brand_match * CONTENT_BASED_WEIGHTS['brand'] +
            grade_match * CONTENT_BASED_WEIGHTS['grade'] +
            scale_match * CONTENT_BASED_WEIGHTS['scale'] +
            price_sim * CONTENT_BASED_WEIGHTS['price'])

            raw_scores.append(score)
            valid_product_ids.append(product_id)

        if not raw_scores:
            results[user_id] = []
            continue

        raw_scores = np.array(raw_scores)
        valid_product_ids = np.array(valid_product_ids)

        # штраф для уже взаимодействованных товаров
        history = user_history.get(user_id, {})
        penalty = np.ones_like(raw_scores)
        for i, pid in enumerate(valid_product_ids):
            if pid in history:
                penalty[i] = np.exp(-INTERACTION_SENSITIVITY_COEFFICIENT * history[pid])
        raw_scores = raw_scores * penalty

        valid_mask = raw_scores > 0
        if not np.any(valid_mask):
            results[user_id] = []
            continue

        candidate_scores = raw_scores[valid_mask]
        candidate_product_ids = valid_product_ids[valid_mask]

        if np.std(candidate_scores) < STD_EPSILON:
            results[user_id] = []
            continue

        min_required = min(rec_length, 3)
        if len(np.unique(candidate_scores)) < min_required:
            results[user_id] = []
            continue

        normalized = normalize_scores(candidate_scores, method='sigmoid')
        confidences = calculate_confidences(candidate_scores)

        final_scores = normalized * confidences

        top_indices = np.argsort(final_scores)[::-1][:rec_length]
        recommendations = []
        for idx in top_indices:
            recommendations.append({
                "sku": candidate_product_ids[idx],
                "score": float(normalized[idx]),
                "confidence": float(confidences[idx])
            })
        results[user_id] = recommendations

    return results

def calculate():
    payload = validate_payload(StrategyPayload)
    rec_length = payload.rec_length
    events = payload.events
    products = payload.products

    if not events or not products:
        print(json.dumps({}))
        sys.exit(0)

    recommendations = content_based(rec_length, events, products)
    print(json.dumps(recommendations))

if __name__ == "__main__":
    calculate()

