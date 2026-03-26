import pandas as pd
import time
from database import engine
from sqlalchemy import text

class EventDataProvider:
    def __init__(self):
        self._cache = None
        self._cache_time = None
        self._cache_ttl = 300 # хранить кеш 5 минут
    
    def get_user_events_with_weights(self, force_refresh=False):
        current_time = time.time()
        
        if (force_refresh or 
            self._cache is None or 
            self._cache_time is None or 
            current_time - self._cache_time > self._cache_ttl):
            
            self._cache = self._fetch_from_db()
            self._cache_time = current_time
            print("🔄 Данные событий обновлены в кэше")
        else:
            print(f"✅ Используются кэшированные данные")
        
        return self._cache.copy()
    
    def _fetch_from_db(self):
        with engine.connect() as conn:
            query = text("""
                SELECT 
                    ue.user_id, 
                    ue.product_id, 
                    et.weight as rating
                FROM user_event ue
                INNER JOIN event_type et ON ue.event_type_id = et.id
                INNER JOIN product p ON ue.product_id = p.id
                WHERE et.is_active = true
                AND p.is_published = true
            """)

            df = pd.read_sql(query, conn)
            return df[['user_id', 'product_id', 'rating']]

event_provider = EventDataProvider()