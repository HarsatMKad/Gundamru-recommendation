import json
import sys
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def calculate():
    input_data = json.load(sys.stdin)
    events = input_data['events']
    rec_length = input_data["recLength"]
    min_similarity_threshold = 0.01
    
    events = [e for e in events if e.get('weight', 0) > 0]
    df = pd.DataFrame(events)
    
    pivot = df.pivot_table(
        index='user_id', 
        columns='product_id', 
        values='weight', 
        fill_value=0,
        aggfunc='sum'
    )
    
    user_means = pivot[pivot > 0].mean(axis=1).fillna(0)
    pivot_centered = pivot.sub(user_means, axis=0)
    pivot_centered = pivot_centered.where(pivot > 0, 0)
    
    item_sim = cosine_similarity(pivot_centered.T)
    item_sim[item_sim < min_similarity_threshold] = 0
    np.fill_diagonal(item_sim, 1.0)
    item_sim_df = pd.DataFrame(item_sim, index=pivot.columns, columns=pivot.columns)
    
    weighted_sum = pivot_centered.dot(item_sim_df)
    similarity_sum = pd.DataFrame(
        np.dot((pivot_centered != 0).astype(float), item_sim_df),
        index=pivot_centered.index,
        columns=item_sim_df.columns
    )
    
    predictions_centered = weighted_sum / similarity_sum.replace(0, np.nan)
    predictions = predictions_centered.add(user_means, axis=0)
    predictions = predictions.where(pivot == 0, np.nan)
    
    results = {}
    for user in predictions.index:
        user_preds = predictions.loc[user].dropna()
        if len(user_preds) > 0:
            top = user_preds.nlargest(rec_length)
            results[user] = [
                {"sku": sku, "score": float(score)} 
                for sku, score in top.items()
            ]
        else:
            results[user] = []
    
    print(json.dumps(results))

if __name__ == "__main__":
    calculate()