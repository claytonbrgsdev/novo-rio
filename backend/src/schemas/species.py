from pydantic import BaseModel

class SpeciesSchema(BaseModel):
    common_name: str
    germinacao_dias: int
    maturidade_dias: int
    agua_diaria_min: float
    espaco_m2: float
    rendimento_unid: int
    tolerancia_seca: str
    germinacao_dias_scaled: float
    maturidade_dias_scaled: float

    class Config:
        orm_mode = True
