from pydantic import BaseModel
from typing import Optional, List
from pydantic import model_validator, field_validator
import re


class Login(BaseModel):
    email : Optional[str]
    password : Optional[str] 

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, v):
        failed = False if re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v) else True
        if failed:
            raise ValueError("value is not an email")
        return v
    
    @field_validator('password')
    @classmethod
    def password_length_validator(cls, v):
        if len(v) < 8:
            raise ValueError('password must be at least 8 characters long')
        return v