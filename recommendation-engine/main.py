from fastapi import FastAPI, HTTPException
from registry import STRATEGIES, STRATEGIES_GLOBAL

app = FastAPI()

@app.post("/calculate/{strategy_name}")
async def calculate_strategy(strategy_name: str, payload: dict):
    if strategy_name not in STRATEGIES:
        raise HTTPException(status_code=404, detail="Strategy not found")
    user_ids = payload.get("user_ids", [])
    try:
        result = await STRATEGIES[strategy_name](user_ids)
        return {"results": result}
    except Exception as e:
        print(f"Error in {strategy_name}: {e}")
        raise HTTPException(status_code=500, detail="Calculation failed")
    
@app.post("/calculate-global/{strategy_name}")
async def calculate_strategy_global(strategy_name: str):
    if strategy_name not in STRATEGIES_GLOBAL:
        raise HTTPException(status_code=404, detail="Global strategy not found")
    try:
        result = await STRATEGIES_GLOBAL[strategy_name]()
        return result
    except Exception as e:
        print(f"Error in global strategy {strategy_name}: {e}")
        raise HTTPException(status_code=500, detail="Calculation failed")
