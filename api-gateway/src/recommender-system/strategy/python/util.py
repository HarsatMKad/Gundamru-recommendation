import numpy as np
from scipy import stats
from config import (
    MIN_CONFIDENCE,
    ZSCORE_SIGMOID_FACTOR,
    DEFAULT_CONFIDENCE_LOW_DATA,
    Z_SCORE_CLIP_MIN,
    Z_SCORE_CLIP_MAX,
    STD_EPSILON
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