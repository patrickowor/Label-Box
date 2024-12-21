from pydantic import BaseModel
from typing import Optional


class AssetDto(BaseModel):
    asset_id : str
    project_id: str 
    annotation: str 
    fresh: bool = False
