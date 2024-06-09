from typing import Optional
import re
from pydantic import BaseModel, Field, EmailStr, field_validator



class User(BaseModel):
    name: str 
    email: EmailStr 
    password: str 
    imgurl: str 

class Logins(BaseModel):
    email: EmailStr
    password: str

class UpdUser(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    imgurl: Optional[str] = None
    password: Optional[str] = None
