import pandas as pd
import numpy as np

def calculate_recommendations(user_ids, df_events, rec_length: int):
    if df_events.empty:
        return {str(uid): [] for uid in user_ids}

    pivot = df_events.pivot_table(
        index='user_id', 
        columns='product_id',
        values='rating', 
        aggfunc='sum'
    ).fillna(0)

    pivot.index = pivot.index.astype(str) 
    item_similarity = pivot.corr(method='pearson')
    results = {}

    for uid in user_ids:
        if uid not in pivot.index.tolist():
            results[str(uid)] = []
            continue

        user_ratings = pivot.loc[uid]
        bought_items = user_ratings[user_ratings > 0].index
        recommendations = pd.Series(dtype=float)
        
        for item in bought_items:
            similar_items = item_similarity[item].sort_values(ascending=False)[1:4]
            recommendations = pd.concat([recommendations, similar_items])
        recommendations = recommendations.drop(bought_items, errors='ignore')
        top_recs = recommendations.groupby(level=0).mean().sort_values(ascending=False).head(rec_length)
        
        results[str(uid)] = [
            {"sku": pid, "score": float(score)} 
            for pid, score in top_recs.items() if not np.isnan(score)
        ]

    return results