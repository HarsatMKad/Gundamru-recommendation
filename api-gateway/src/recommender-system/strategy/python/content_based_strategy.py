import pandas as pd
import numpy as np
from datetime import datetime
from typing import List
from util import calculate_confidences, calculate_time_weight, normalize_scores
from classes import Event, Product
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
    
    product_ids = list(products_dict.keys())
    product_brands = np.array([products_dict[pid].brand_id for pid in product_ids])
    product_grades = np.array([products_dict[pid].grade for pid in product_ids])
    product_scales = np.array([products_dict[pid].scale for pid in product_ids])
    product_prices = np.array([products_dict[pid].price for pid in product_ids])

    unique_brands = list(set(product_brands))
    unique_grades = list(set(product_grades))
    unique_scales = list(set(product_scales))
    
    brand_to_idx = {b: i for i, b in enumerate(unique_brands)}
    grade_to_idx = {g: i for i, g in enumerate(unique_grades)}
    scale_to_idx = {s: i for i, s in enumerate(unique_scales)}

    brand_indices = np.array([brand_to_idx[b] for b in product_brands])
    grade_indices = np.array([grade_to_idx[g] for g in product_grades])
    scale_indices = np.array([scale_to_idx[s] for s in product_scales])
    
    current_time_ms = datetime.now().timestamp() * 1000
    df_events['final_weight'] = df_events.apply(
        lambda row: row['weight'] * row['count'] *
        calculate_time_weight(current_time_ms, row['timestamp'], row['retention_days']),
        axis=1
    )

    user_product_counts = df_events.groupby('user_id')['product_id'].nunique()
    valid_users = user_product_counts[user_product_counts > MIN_PRODUCT_FOR_USER].index
    df_events = df_events[df_events['user_id'].isin(valid_users)]
    
    if df_events.empty:
        return {}

    user_groups = df_events.groupby('user_id')

    results = {}
    for user_id, group in user_groups:
        brand_profile = np.zeros(len(unique_brands))
        grade_profile = np.zeros(len(unique_grades))
        scale_profile = np.zeros(len(unique_scales))
        
        total_weight = 0.0
        price_sum = 0.0
        history = {}
        
        for _, row in group.iterrows():
            pid = row['product_id']
            if pid not in products_dict:
                continue
                
            w = row['final_weight']
            total_weight += w
            
            history[pid] = history.get(pid, 0) + w
            price_sum += products_dict[pid].price * w
            
            brand_idx = brand_to_idx[products_dict[pid].brand_id]
            grade_idx = grade_to_idx[products_dict[pid].grade]
            scale_idx = scale_to_idx[products_dict[pid].scale]
            
            brand_profile[brand_idx] += w
            grade_profile[grade_idx] += w
            scale_profile[scale_idx] += w
        
        if total_weight == 0:
            continue
        
        brand_profile /= total_weight
        grade_profile /= total_weight
        scale_profile /= total_weight
        avg_price = price_sum / total_weight
        
        product_brand_indices = brand_indices
        product_grade_indices = grade_indices
        product_scale_indices = scale_indices
        
        brand_scores = brand_profile[product_brand_indices]
        grade_scores = grade_profile[product_grade_indices]
        scale_scores = scale_profile[product_scale_indices]
        
        if avg_price > 0:
            price_diff = np.abs(product_prices - avg_price) / np.maximum(product_prices, avg_price)
            price_sim = 1.0 - price_diff

        raw_scores = (brand_scores * CONTENT_BASED_WEIGHTS['brand'] + 
                     grade_scores * CONTENT_BASED_WEIGHTS['grade'] + 
                     scale_scores * CONTENT_BASED_WEIGHTS['scale'] +
                     price_sim * CONTENT_BASED_WEIGHTS['price'])
        
        # штраф к уже взаимодействованным товарам
        for pid, weight in history.items():
            if pid in products_dict:
                idx = product_ids.index(pid)
                raw_scores[idx] *= np.exp(-INTERACTION_SENSITIVITY_COEFFICIENT * weight)
        
        # Проверка: есть ли кандидаты?
        valid_mask = raw_scores > 0
        if not np.any(valid_mask):
            results[user_id] = []
            continue
        
        candidate_scores = raw_scores[valid_mask]
        candidate_indices = np.where(valid_mask)[0]
        candidate_product_ids = [product_ids[i] for i in candidate_indices]
        
        # Проверка: информативны ли предсказания?
        if len(candidate_scores) < 2 or np.std(candidate_scores) < STD_EPSILON:
            results[user_id] = []
            continue
        
        min_required = min(rec_length, 3)
        if len(np.unique(candidate_scores)) < min_required:
            results[user_id] = []
            continue
        
        normalized = normalize_scores(candidate_scores, method='sigmoid')
        confidences = calculate_confidences(candidate_scores)
        
        final_scores = normalized * confidences
        
        top_k = min(rec_length, len(final_scores))
        top_indices = np.argsort(final_scores)[::-1][:top_k]
        
        recommendations = [
            {
                "sku": candidate_product_ids[idx],
                "score": float(normalized[idx]),
                "confidence": float(confidences[idx])
            }
            for idx in top_indices
        ]
        
        results[user_id] = recommendations
    return results