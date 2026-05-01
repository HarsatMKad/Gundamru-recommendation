import json
import sys
from datetime import datetime
from util.classes import Payload
from util.services import validate_payload
from util.registry import STRATEGIES_CONFIG
from config import Config

def main():
    start_time = datetime.now()
    payload = validate_payload(Payload)
    rec_length = payload.recLength
    strategy_names = payload.strategies
    events = payload.events
    products = payload.products
    config = payload.config

    if not strategy_names or not events or not rec_length or not config:
        print(json.dumps({}))
        sys.exit(0)

    Config.update_config(config)

    print(f"Getted strategies: {len(strategy_names)}, User events: {len(events)}, Products: {len(products)}", file=sys.stderr)
    
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
            print(f"Strategy {strategy_name} time: {elapsed:.3f} sec", file=sys.stderr)
        except Exception as e:
            print(f"Ошибка в стратегии {strategy_name}: {str(e)}", file=sys.stderr)
            results[strategy_name] = {} if STRATEGIES_CONFIG[strategy_name]["is_personal"] else []
    
    end_time = datetime.now()
    total_elapsed = (end_time - start_time).total_seconds()
    print(f"All strategys time {total_elapsed:.3f} sec", file=sys.stderr)

    print(json.dumps(results))

if __name__ == "__main__":
    main()