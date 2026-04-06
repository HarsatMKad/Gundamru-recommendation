import json
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity
from util import calculate_confidences, calculate_time_weight
from config import (
    MIN_SIMILARITY_THRESHOLD,
    MIN_CONFIDENCE,
    ZSCORE_SIGMOID_FACTOR,
    DEFAULT_CONFIDENCE_LOW_DATA,
    NORMALIZATION_MIN,
    NORMALIZATION_MAX,
    NORMALIZATION_DEFAULT
    )

def calculate():
    input_data = json.load(sys.stdin)
    events = input_data['events']
    rec_length = input_data["recLength"]
    
    events = [e for e in events if e.get('weight', 0) > 0]

    if not events:
        print(json.dumps({}))
        return

    df = pd.DataFrame(events)

    current_time_ms = datetime.now().timestamp() * 1000
    df['final_weight'] = df.apply(
        lambda row: row['weight'] * row['count'] * calculate_time_weight(
            current_time_ms,
            row['timestamp'], 
            row['retention_days'],
        ),
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
        
        if not np.any(valid_mask):
            results[user_id] = []
            continue
        
        raw_scores = user_preds[valid_mask]
        product_indices = np.where(valid_mask)[0]
        
        raw_min, raw_max = raw_scores.min(), raw_scores.max()
        if raw_max > raw_min:
            normalized_scores = NORMALIZATION_MIN + (NORMALIZATION_MAX - NORMALIZATION_MIN) * (raw_scores - raw_min) / (raw_max - raw_min)
        else:
            normalized_scores = np.full_like(raw_scores, NORMALIZATION_DEFAULT)
        
        adjusted_confidences = calculate_confidences(raw_scores, MIN_CONFIDENCE, ZSCORE_SIGMOID_FACTOR, DEFAULT_CONFIDENCE_LOW_DATA)
        
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