import json
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
from util import calculate_confidences, calculate_time_weight, normalize_scores, validate_payload
from typing import List
from config import (
    MIN_SIMILARITY_THRESHOLD,
    MIN_CONFIDENCE,
    ZSCORE_SIGMOID_FACTOR,
    DEFAULT_CONFIDENCE_LOW_DATA,
    MIN_PRODUCT_FOR_USER
    )

class Event(BaseModel):
    user_id: str
    product_id: str
    weight: float
    count: int
    timestamp: int
    retention_days: int

class StrategyPayload(BaseModel):
    rec_length: int
    events: List[Event]

def calculate():
    payload = validate_payload(StrategyPayload)
    rec_length = payload.rec_length
    events = payload.events

    events = [e for e in events if e.weight > 0]

    if not events:
        print(json.dumps({}))
        sys.exit(0)

    list_of_dicts = [e.model_dump() for e in events] 

    df = pd.DataFrame(list_of_dicts)

    user_unique_products = df.groupby('user_id')['product_id'].nunique()
    valid_users = user_unique_products[user_unique_products > MIN_PRODUCT_FOR_USER].index
    df = df[df['user_id'].isin(valid_users)]

    if df.empty:
        print(json.dumps({}))
        sys.exit(1)

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
    
    user_means = np.zeros(pivot_matrix.shape[0])
    for i in range(pivot_matrix.shape[0]):
        row = pivot_matrix[i]
        non_zero = row[row > 0]
        user_means[i] = non_zero.mean() if len(non_zero) > 0 else 0
    
    pivot_centered = pivot_matrix - user_means.reshape(-1, 1)
    pivot_centered[pivot_matrix == 0] = 0
    
    user_sim = cosine_similarity(pivot_centered)
    user_sim[user_sim < MIN_SIMILARITY_THRESHOLD] = 0
    np.fill_diagonal(user_sim, 1.0)

    sim_sum = user_sim.sum(axis=1, keepdims=True)
    sim_sum[sim_sum == 0] = 1
    user_sim_norm = user_sim / sim_sum

    predictions_centered = user_sim_norm @ pivot_centered
    predictions = predictions_centered + user_means.reshape(-1, 1)
    predictions[pivot_matrix > 0] = np.nan
    
    results = {}
    for user_idx, user_id in enumerate(user_ids):
        user_preds = predictions[user_idx]
        valid_mask = ~np.isnan(user_preds)
        
        # Проверка: есть ли кандидаты?
        if not np.any(valid_mask):
            results[user_id] = []
            continue
        
        raw_scores = user_preds[valid_mask]
        product_indices = np.where(valid_mask)[0]

        # Проверка: информативны ли предсказания?
        if np.std(raw_scores) < 1e-6:
            results[user_id] = []
            continue

        # Проверка: достаточно ли уникальных значений?
        min_required = min(rec_length, 3)
        unique_scores = len(np.unique(raw_scores))
        if unique_scores < min_required:
            sys.stderr.write(f"User {user_id}: skipped - only {unique_scores} unique scores (need {min_required})\n")
            results[user_id] = []
            continue
        
        normalized_scores = normalize_scores(raw_scores, method='sigmoid')

        adjusted_confidences = calculate_confidences(
            raw_scores, MIN_CONFIDENCE, ZSCORE_SIGMOID_FACTOR, DEFAULT_CONFIDENCE_LOW_DATA
        )
        
        final_scores = normalized_scores * adjusted_confidences
        top_indices = np.argsort(final_scores)[::-1][:rec_length]
        
        results[user_id] = [
            {
                "sku": product_ids[product_indices[idx]], 
                "score": float(normalized_scores[idx]),
                "confidence": float(adjusted_confidences[idx])
            }
            for idx in top_indices
        ]
    
    print(json.dumps(results))

if __name__ == "__main__":
    calculate()