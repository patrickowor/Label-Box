from sqlmodel import SQLModel, Field
import uuid 
from datetime import datetime, date
from typing import Optional
import random

class UserOptionalData(SQLModel):
    date_of_birth : Optional[date] 
    social_security_number : Optional[str]
    tax_id : Optional[str] 
    birth_place : Optional[str] 
    address_id : Optional[str] 
    failed_login_count : Optional[int]
    last_failed_login_attempt : Optional[datetime]
    id_number : Optional[str]
    cv : Optional[str]
    working : Optional[bool]

    class Config:
        arbitrary_types_allowed = True


class User(UserOptionalData, table=True):
    ''' this is an example user model for sqlmodel'''
    id: str = Field(default_factory= lambda : str(uuid.uuid4()), primary_key=True, unique=True)
    password : str 
    last_login : Optional[datetime]

    first_name :str 
    last_name : str 
    other_names :  Optional[str]

    email : str = Field(unique=True)
    # is_staff : bool = Field(default=False) 
    is_active : bool = Field(default=False)
    date_joined : datetime = Field(default_factory=datetime.utcnow)
    has_legacy : Optional[bool] = Field(default=False)
    deleted : Optional[bool] = Field(default=False)
    deleted_at : Optional[date]
    # has security question
    # has UserpermisionLevel

    class Config:
        arbitrary_types_allowed = True

class UserIdImage(SQLModel, table=True):
    id : int = Field(primary_key=True)
    user_id : str 
    id_type : int 
    image_type_1 : str
    image_type_2 : str
    related_id : int 



class UserSecurityQuestion(SQLModel, table=True):
    id : int = Field(primary_key=True)
    user_id : str 
    question_1 : str 
    answer_1 : str 
    question_2 : str
    answer_2 : str 
    question_3 : str 
    answer_3 : str 
   

class UserPermissions(SQLModel, table=True):
    id : int = Field(primary_key=True)
    user_id : str 
    permission_id : int 


class UserDevice(SQLModel, table=True):
    id : int = Field(primary_key=True)
    user_id : str 
    device_id : str 

class Permissions(SQLModel, table=True):
    id : int = Field(primary_key=True)
    name : str
    admin: Optional[bool] = Field(default=False)

class SecurityQuestion(SQLModel, table=True):
    id : int = Field(primary_key=True)
    question : str 

class ForgotPassword(SQLModel, table=True):
    id : int = Field(primary_key=True)
    code : str 
    user_id : str
    time : datetime = Field(default_factory = datetime.now)

class Address(SQLModel, table=True):
    id : int = Field(primary_key=True)
    building_number : Optional[str] 
    street_address : Optional[str] 
    address_add_on : Optional[str] 
    zip_code : Optional[str]
    city : Optional[str] 
    state : Optional[str] 
    country : Optional[str] 
    country_code : Optional[str] 
    phone : Optional[str] 

class Token(SQLModel, table=True):
    id : int = Field(primary_key=True)
    token : str # token is encrypted
    updated_at : datetime = Field(default_factory=  datetime.now )

class Servers(SQLModel, table=True):
    id : str = Field(default_factory=lambda : str(uuid.uuid4()), primary_key=True)
    name : str = Field( unique=True)


class UserOtp(SQLModel, table=True):
    ''' this is the user otp model'''
    id: str = Field(default_factory= lambda : str(uuid.uuid4()), primary_key=True, unique=True)
    email : str 
    otp: str = Field(default_factory= lambda: str(random.randint(1000, 9999)))