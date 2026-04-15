from strategy.collab_user_based_strategy import collab_user_based
from strategy.content_based_strategy import content_based
from strategy.global_popular_strategy import global_popularity

STRATEGIES_CONFIG = {
    "collab_user_based": {
        "func": collab_user_based,
        "needs_products": True,
        "is_personal": True
    },
    "content_based": {
        "func": content_based,
        "needs_products": True,
        "is_personal": True
    },
    "global_popylar": {
        "func": global_popularity,
        "needs_products": False,
        "is_personal": False
    }
}
