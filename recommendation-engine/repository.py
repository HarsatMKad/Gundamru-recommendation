import pandas as pd
from sqlalchemy import text
from database import engine

def get_user_events_dataframe():
    with engine.connect() as conn:
        query = text("""
            SELECT 
                ue.user_id, 
                ue.product_id, 
                et.weight as rating
            FROM user_events ue
            INNER JOIN event_types et ON ue.event_type_id = et.id
            WHERE et.is_active = true
        """)
        
        df = pd.read_sql(query, conn)
    return df[['user_id', 'product_id', 'rating']]