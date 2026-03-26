from engine.collab import calculate_recommendations
from services.data_provider import get_user_events_data

async def calculate(user_ids: list[int]) -> dict:
    df = get_user_events_data()
    return calculate_recommendations(user_ids, df, 10)