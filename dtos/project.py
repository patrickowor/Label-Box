from pydantic import BaseModel
from typing import Optional


class ProjectDto(BaseModel):
    name : str
