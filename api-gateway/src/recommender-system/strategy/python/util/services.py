import json
import sys
import numpy as np
from scipy import stats
from pydantic import BaseModel, ValidationError
from util.classes import Payload
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
    NORMALIZATION_MIN,
    NORMALIZATION_MAX,
    NORMALIZATION_DEFAULT,
    )

def validate_payload(model_class: BaseModel) -> Payload:
    try:
        raw_data = json.load(sys.stdin)
        return model_class(**raw_data)
    except ValidationError as e:
        print(f"Validation Error: {e.json()}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

def calculate_confidences(raw_scores):
    if len(raw_scores) <= 2:
        return np.full_like(raw_scores, DEFAULT_CONFIDENCE_LOW_DATA)
    
    if np.std(raw_scores) < STD_EPSILON:
        return np.full_like(raw_scores, MIN_CONFIDENCE / 2)

    try:
        z_scores = stats.zscore(raw_scores)
        z_scores = np.clip(z_scores, Z_SCORE_CLIP_MIN, Z_SCORE_CLIP_MAX)
        confidences = 1 / (1 + np.exp(-z_scores * ZSCORE_SIGMOID_FACTOR))
        return MIN_CONFIDENCE + confidences * (1 - MIN_CONFIDENCE)
    except Exception:
        return np.full_like(raw_scores, DEFAULT_CONFIDENCE_LOW_DATA)
    
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

def normalize_scores(scores, method='sigmoid', min_val=NORMALIZATION_MIN, max_val=NORMALIZATION_MAX, epsilon=1e-6):
    scores = np.asarray(scores)
    
    if method == 'minmax':
        min_score, max_score = scores.min(), scores.max()
        if max_score - min_score > epsilon:
            normalized = (scores - min_score) / (max_score - min_score)
        else:
            normalized = np.full_like(scores, NORMALIZATION_DEFAULT)
    
    elif method == 'sigmoid':
        mean_val = scores.mean()
        std_val = scores.std()
        if std_val < epsilon:
            normalized = np.full_like(scores, NORMALIZATION_DEFAULT)
        else:
            z_scores = (scores - mean_val) / (std_val * 1.5)
            normalized = 1 / (1 + np.exp(-z_scores))
    
    elif method == 'rank':
        from scipy.stats import rankdata
        ranks = rankdata(scores)
        normalized = (ranks - 1) / (len(ranks) - 1) if len(ranks) > 1 else np.full_like(scores, NORMALIZATION_DEFAULT)
    
    elif method == 'log':
        shifted = scores - scores.min() + 1
        log_scores = np.log1p(shifted)
        normalized = log_scores / log_scores.max()
    
    elif method == 'tanh':
        mean_val = scores.mean()
        std_val = scores.std()
        if std_val < epsilon:
            normalized = np.full_like(scores, NORMALIZATION_DEFAULT)
        else:
            normalized = np.tanh((scores - mean_val) / (std_val * 2))
            normalized = (normalized + 1) / 2
    else:
        raise ValueError(f"Unknown method: {method}")
    
    return min_val + normalized * (max_val - min_val)