from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Evento(BaseModel):
    nombre: str
    timestamp: datetime
    lugar: str
    lat: float
    lon: float
    organizador: EmailStr
    imagen: Optional[str]
