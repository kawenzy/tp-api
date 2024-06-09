from pydantic import BaseModel,Field
from typing import Optional

class Notes(BaseModel):
    title: str
    description: str

class NoteUpd(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None