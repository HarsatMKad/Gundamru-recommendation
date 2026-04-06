import numpy as np
from scipy import stats
from config import (
    MIN_CONFIDENCE,
    ZSCORE_SIGMOID_FACTOR,
    DEFAULT_CONFIDENCE_LOW_DATA,
    Z_SCORE_CLIP_MIN,
    Z_SCORE_CLIP_MAX,
    STD_EPSILON,
    MAX_DATE_WEIGHT,
    MIN_DATE_WEIGHT,
    PLATEAU_DAYS,
    )

def calculate_confidences(raw_scores, min_confidence=MIN_CONFIDENCE, 
                          sigmoid_factor=ZSCORE_SIGMOID_FACTOR, 
                          default_confidence=DEFAULT_CONFIDENCE_LOW_DATA):
    if len(raw_scores) <= 2:
        return np.full_like(raw_scores, default_confidence)
    
    if np.std(raw_scores) < STD_EPSILON:
        return np.full_like(raw_scores, min_confidence)
    
    try:
        z_scores = stats.zscore(raw_scores)
        z_scores = np.clip(z_scores, Z_SCORE_CLIP_MIN, Z_SCORE_CLIP_MAX)
        confidences = 1 / (1 + np.exp(-z_scores * sigmoid_factor))
        return min_confidence + confidences * (1 - min_confidence)
    except Exception:
        return np.full_like(raw_scores, default_confidence)
    
def calculate_time_weight(current_time_ms, timestamp_ms, retention_days):    
    age_in_days = (current_time_ms - timestamp_ms) / (1000 * 60 * 60 * 24)
    
    if age_in_days <= PLATEAU_DAYS:
        return MAX_DATE_WEIGHT
    
    if age_in_days >= retention_days:
        return MIN_DATE_WEIGHT
    
    decay_duration = retention_days - PLATEAU_DAYS
    age_in_decay = age_in_days - PLATEAU_DAYS
    
    decay_progress = age_in_decay / decay_duration
    return MAX_DATE_WEIGHT - (MAX_DATE_WEIGHT - MIN_DATE_WEIGHT) * decay_progress