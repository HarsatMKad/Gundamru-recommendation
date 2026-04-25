import json
import sys
from datetime import datetime
from util.classes import Payload
from util.services import validate_payload
from util.registry import STRATEGIES_CONFIG

def main():
    start_time = datetime.now()
    payload = validate_payload(Payload)
    rec_length = payload.recLength
    strategy_names = payload.strategies
    events = payload.events
    products = payload.products

    if not strategy_names or not events or not rec_length:
        print(json.dumps({}))
        sys.exit(0)

    print(f"Получено стратегий: {len(strategy_names)}, Событий: {len(events)}, Товаров: {len(products)}", file=sys.stderr)
    
    results = {}
    for strategy_name in strategy_names:
        try:
            strategy_start = datetime.now()
            
            config = STRATEGIES_CONFIG[strategy_name]
            if config["needs_products"]:
                result = config["func"](rec_length, events, products)
            else:
                result = config["func"](rec_length, events)
            results[strategy_name] = result
            
            strategy_end = datetime.now()
            elapsed = (strategy_end - strategy_start).total_seconds()
            print(f"Стратегия {strategy_name} выполнена за {elapsed:.2f} сек", file=sys.stderr)
        except Exception as e:
            print(f"Ошибка в стратегии {strategy_name}: {str(e)}", file=sys.stderr)
            results[strategy_name] = {} if STRATEGIES_CONFIG[strategy_name]["is_personal"] else []
    
    end_time = datetime.now()
    total_elapsed = (end_time - start_time).total_seconds()
    print(f"Расчет всех стратегий занял {total_elapsed:.2f} сек", file=sys.stderr)

    print(json.dumps(results))

if __name__ == "__main__":
    main()