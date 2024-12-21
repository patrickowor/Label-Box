from typing import List

from fastapi import  Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class Error(BaseModel):
    message: str
    type: str


class ErrorResponse(BaseModel):
    detail: List[Error]


def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Format the pydantic ValidationErrors in a more human-readable way.
    """

    def create_message(err):
        try:
            return f"""{err["loc"][1]} {err["msg"]} in {err["loc"][0]}"""
        except:
            f"""{err["msg"]} in {err["loc"]}"""

    errors = {
        "detail": [
           {
                "message":  create_message(err),
                "type": err["type"],
            } 
        ] for err in exc.errors()
    }
    error_res = ErrorResponse(**errors)
    return JSONResponse(
        content=jsonable_encoder(error_res.detail[0]),
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )
