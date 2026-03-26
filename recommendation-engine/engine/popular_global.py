def calculate_popular_global(df, rec_length: int):
    if df.empty:
        return []
    
    popular_items = df.groupby('product_id')['rating'].sum().reset_index()
    popular_items = popular_items.rename(columns={
    'product_id': 'sku',
    'rating': 'score'
    })
    
    max_score = popular_items['score'].max()
    if max_score > 0:
        popular_items['score'] = popular_items['score'] / max_score
    
    # Сортируем и берем топ (или сколько нужно)
    result = popular_items.sort_values('score', ascending=False).head(rec_length)
    
    return result.to_dict(orient='records')