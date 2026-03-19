from strategies import collab, popular_global

STRATEGIES = {
    "collab": collab.calculate,
    "popular": collab.calculate,
}

STRATEGIES_GLOBAL = {
    "popular_global": popular_global.calculate
}