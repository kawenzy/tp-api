from pydantic import BaseModel,Field
from typing import Optional


class Komen(BaseModel):
    msg: str