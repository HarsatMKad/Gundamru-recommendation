from pydantic import BaseModel, Field
from typing import List
from pydantic.alias_generators import to_snake

class Event(BaseModel):
    user_id: str = Field(alias='userId')
    product_id: str = Field(alias='productId')
    weight: float
    count: int
    timestamp: int
    retention_days: int = Field(alias='retentionDays')
    class Config:
        populate_by_name = True
        alias_generator = to_snake

class Product(BaseModel):
    id: str
    brand_id: str = Field(alias='brandId')
    grade: str
    scale: str
    price: int = Field(default=0)
    class Config:
        populate_by_name = True
        alias_generator = to_snake

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