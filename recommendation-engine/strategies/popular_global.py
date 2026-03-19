from engine.popular_global import calculate_popular_global
from services.data_provider import get_user_events_data

async def calculate() -> dict:
    df = get_user_events_data()
    return calculate_popular_global(df)