from fastapi import FastAPI

from app.db import init_db
from app.models import *
from app.fastapi_442 import RequestValidationError, validation_exception_handler, ErrorResponse
import httpx 
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import os 


from routes.views import app as viewableRouter 
from fastapi.staticfiles import StaticFiles
 


@asynccontextmanager
async def fastapi_lifespan(app: FastAPI):
    app.async_request = httpx.AsyncClient()
    yield
    await app.async_request.aclose()

app = FastAPI(
    title="LabelBox",
    lifespan=fastapi_lifespan,
    exception_handlers={RequestValidationError: validation_exception_handler},
    responses={
        422: {
            "description": "Validation Error",
            "model": ErrorResponse,
        },
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(viewableRouter)

if (not os.path.exists("template/public")):
    os.mkdir("template/public")

app.mount("/", StaticFiles(directory="template"), name="static")

@app.on_event("startup")
async def on_startup():
    pass
    # init_db()       
    