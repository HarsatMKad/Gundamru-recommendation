import pandas as pd
import numpy as np
from datetime import datetime
from typing import List
from util.services import calculate_confidences, calculate_time_weight, normalize_scores
from util.classes import Event
from config import Config

def global_popularity(rec_length: int, events: List[Event]):
    events = [e for e in events if e.weight > 0]

    if not events:
        return []

    event_of_dicts = [e.model_dump() for e in events]
    df = pd.DataFrame(event_of_dicts)

    current_time_ms = datetime.now().timestamp() * 1000
    df['final_weight'] = df.apply(
        lambda row: row['weight'] *
            row['count'] *
            calculate_time_weight(current_time_ms, row['timestamp'], row['retention_days']),
        axis=1
    )
    product_popularity = df.groupby('product_id')['final_weight'].sum().reset_index()
    product_popularity.columns = ['product_id', 'raw_score']

    user_product_counts = df.groupby('user_id')['product_id'].nunique()
    valid_users = user_product_counts[user_product_counts > Config.MIN_PRODUCT_FOR_USER].index
    df_valid_users = df[df['user_id'].isin(valid_users)]

    if not df_valid_users.empty:
        valid_popularity = df_valid_users.groupby('product_id')['final_weight'].sum()
        smoothing_factor = 0.7
        product_popularity['raw_score'] = (
            smoothing_factor * product_popularity['raw_score'] +
            (1 - smoothing_factor) * product_popularity['product_id'].map(valid_popularity).fillna(0)
        )

    raw_scores = product_popularity['raw_score'].values

    if len(raw_scores) == 0 or np.std(raw_scores) < Config.STD_EPSILON:
        return []
    
    normalized_scores = normalize_scores(raw_scores, method='sigmoid')
    confidences = calculate_confidences(raw_scores)

    top_indices = np.argsort(normalized_scores)[::-1][:rec_length]

    recommendations = [
        {
            "sku": product_popularity.iloc[idx]['product_id'],
            "score": float(normalized_scores[idx]),
            "confidence": float(confidences[idx])
        }
        for idx in top_indices
    ]

    return recommendations