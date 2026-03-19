from event_provider import EventDataProvider

_event_provider_instance = None

def get_event_provider():
    global _event_provider_instance
    if _event_provider_instance is None:
        _event_provider_instance = EventDataProvider()
        print("✅ EventDataProvider инициализирован")
    return _event_provider_instance

def get_user_events_data():
    provider = get_event_provider()
    return provider.get_user_events_with_weights()

event_provider = get_event_provider()