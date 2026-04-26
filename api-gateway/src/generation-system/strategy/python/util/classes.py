from pydantic import BaseModel, Field
from typing import List

class Event(BaseModel):
    user_id: str
    product_id: str
    weight: float
    count: int
    timestamp: int
    retention_days: int

class Product(BaseModel):
    id: str
    brand_id: str
    grade: str
    scale: str
    price: int = Field(default=0)

class WeightCharacteristics(BaseModel):
    brand: float
    grade: float
    scale: float
    price: float

class PythonConfig(BaseModel):
    minProductForUser: int
    minSumularityThreshold: float
    pricePercentageRande: float
    priceCoefficient: float
    interactionSensitivityCoefficient: float
    maxDateWeight: float
    minDateWeight: float
    relevanceDays: int
    weightCharacteristics: WeightCharacteristics

class Payload(BaseModel):
    recLength: int
    strategies: List[str]
    events: List[Event]
    products: List[Product]
    config: PythonConfig