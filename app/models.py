from sqlmodel import SQLModel, Field
import uuid 
from typing import Optional


class User(SQLModel, table=True):
    ''' this is an example user model for sqlmodel'''
    id: str = Field(default_factory= lambda : str(uuid.uuid4()), primary_key=True, unique=True)
    password : str 
    email : str = Field(unique=True)
    current_project: Optional[str]

    class Config:
        arbitrary_types_allowed = True

class Project(SQLModel, table=True):
    ''' this is an example user model for sqlmodel'''
    id: str = Field(default_factory= lambda : str(uuid.uuid4()), primary_key=True, unique=True)
    project_name : str
    user_id: str

    class Config:
        arbitrary_types_allowed = True

class Assets(SQLModel, table=True):
    ''' this is an example user model for sqlmodel'''
    id: str = Field(default_factory= lambda : str(uuid.uuid4()), primary_key=True, unique=True)
    project_id: str 
    filename: str 
    content_type: str 
    base64_data: str
    # TODO: add other image asset info
    anotations: Optional[str]

    class Config:
        arbitrary_types_allowed = True