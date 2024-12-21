from typing import Optional, List, Any
from dtos.login import Login as LoginDto
from dtos.project import ProjectDto
from dtos.assets import AssetDto
from fastapi import APIRouter, File, UploadFile, Depends, Response, Request, Form
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db import get_session
from app.models import User, Project, Assets
from app.authentication import auth_handler
from sqlmodel import select, delete
import base64 as B64
import json
from os.path import isfile
from fastapi import Response
from mimetypes import guess_type
import os

app = APIRouter()

@app.post("/signup")
@app.post("/login")
async def login(
    data : LoginDto,
    response : Response,
    session : AsyncSession = Depends(get_session)
):
    user: Optional[User] =  (await session.exec(select(User).where(User.email == data.email) )).first()
    if user == None:
        user = User(email=data.email, password= auth_handler.get_password_hash(data.password))

        session.add(user)
        await session.commit()
        await session.refresh(user)
    else:
        if not auth_handler.verify_password(data.password, user.password):
            response.status_code = 400
            return {'message': 'user email and password do not match'}
    token = auth_handler.encode_token(user.id.strip())
    return {"message": "success", "data":  { "token" : token}}


@app.get("/project")
async def get_projects(
    response : Response,
    session : AsyncSession = Depends(get_session),
    userId: str =Depends(auth_handler.auth_wrapper)
):
    user : User = (await session.exec(select(User).where(User.id == userId))).first()
    if user == None:
        response.status_code = 400
        return {'message':'user doesnt exist'}
    
    projects: Optional[List[Project]] =  (await session.exec(select(Project).where(Project.user_id == userId) )).all()
    return {"message": "success", "data": projects}

@app.post("/project")
async def post_projects(
    data : ProjectDto,
    response : Response,
    session : AsyncSession = Depends(get_session),
    userId: str =Depends(auth_handler.auth_wrapper)
):
    user : User = (await session.exec(select(User).where(User.id == userId))).first()

    if user == None:
        response.status_code = 400
        return {'message':'user doesnt exist'}
    
    if (await session.exec(select(Project).where(Project.project_name == data.name) )).first() != None:
        response.status_code = 400
        return {'message':'project name already exist'}
    project = Project(project_name=data.name, user_id=userId)

    session.add(project)
    await session.commit()
    await session.refresh(project)

    return {"message": "success", "data": project}

@app.delete("/project/{projectId}")
async def delete_projects(
    projectId : str,
    response : Response,
    session : AsyncSession = Depends(get_session),
    userId: str =Depends(auth_handler.auth_wrapper)
):
    user : User = (await session.exec(select(User).where(User.id == userId))).first()

    if user == None:
        response.status_code = 400
        return {'message':'user doesnt exist'}
    await session.exec(delete(Project).where(Project.id == projectId, Project.user_id == userId))

    await session.commit()

    return {"message": "success"}

@app.get("/assets/project/{project_id}")
async def get_projects(
    project_id: str,
    response : Response,
    session : AsyncSession = Depends(get_session),
    userId: str =Depends(auth_handler.auth_wrapper)
):
    user : User = (await session.exec(select(User).where(User.id == userId))).first()

    if user == None:
        response.status_code = 400
        return {'message':'user doesnt exist'}

    project = (await session.exec(select(Project).where(Project.id == project_id, Project.user_id == userId))).first()
    if project == None:
        response.status_code = 400
        return {'message':'project doesn\'t exist'}

    assets: List[Assets] = (await session.exec(select(Assets).where(Assets.project_id == project_id and Project.user_id == userId))).all()

    data = [ {
        "image": f"/asset/blob/{asset.id}/{asset.filename}", 
        "project_id": asset.project_id, 'id': asset.id , 
        'name' : asset.filename, 
        'annotations' : json.loads(asset.anotations) if asset.anotations != None else []
        }  for asset in assets]
    return {"message": "success", "data": data} 

@app.post("/asset/upload")
async def upload_asset(
    response : Response,
    project_id: str= File(...),
    file: UploadFile = File(),
    session : AsyncSession = Depends(get_session),
    userId: str =Depends(auth_handler.auth_wrapper)
):
    user : User = (await session.exec(select(User).where(User.id == userId))).first()

    if user == None:
        response.status_code = 400
        return {'message':'user doesnt exist'}

    project = (await session.exec(select(Project).where(Project.id == project_id, Project.user_id == userId))).first()
    if project == None:
        response.status_code = 400
        return {'message':'project doesn\'t exist'}
    file_data =file.file.read()
    base64 = B64.b64encode(file_data).decode('utf-8')
    asset = Assets(
        project_id= project_id,
        filename = file.filename,
        content_type = file.content_type,
        base64_data= base64
    )
    
    session.add(asset)
    await session.commit()
    await session.refresh(asset)
    return {"message": "success"}


@app.post("/asset/annotate")
async def upload_asset(
    data: AssetDto,
    response : Response,
    session : AsyncSession = Depends(get_session),
    userId: str =Depends(auth_handler.auth_wrapper)
):
    user : User = (await session.exec(select(User).where(User.id == userId))).first()

    if user == None:
        response.status_code = 400
        return {'message':'user doesnt exist'}

    project = (await session.exec(select(Project).where(Project.id == data.project_id, Project.user_id == userId))).first()
    if project == None:
        response.status_code = 400
        return {'message':'project doesn\'t exist'}

    asset: Optional[Assets] = (await session.exec(select(Assets).where(Assets.id == data.asset_id))).first()
    if asset == None:
        response.status_code = 400
        return {'message':'asset doesn\'t exist'}

    if not (data.annotation.startswith('[') and 
        data.annotation.endswith(']')):
        response.status_code = 400
        return {'message':'invalid annotation data'}

    annotated_array : List[Any] = json.loads(data.annotation)
    if asset.anotations != None and not data.fresh :
        existing_array =  json.loads(asset.anotations)
        annotated_array = [ *annotated_array, *existing_array]
    asset.anotations = json.dumps(annotated_array)
    
    session.add(asset)
    await session.commit()
    await session.refresh(asset)

    return {"message": "success", "data": annotated_array}

@app.get('/asset/blob/{id}/{filename}')
async def get_asset_file(
    id: str,
    filename: str,
    response : Response,
    session : AsyncSession = Depends(get_session),
):
    asset: Optional[Assets] = (await session.exec(select(Assets).where(Assets.id == id, Assets.filename == filename))).first()
    if asset == None:
        response.status_code = 400
        return {'message':'asset doesn\'t exist'}

    base64 = asset.base64_data.encode("utf-8")
    file = B64.b64decode(base64)
    
    headers = {
       # "Content-Disposition": f"attachment; filename={asset.filename}", # for downloading file as attachment
        "Content-Disposition": f"inline; filename={asset.filename}" # for viewing on browser
    }

    return Response(content=file, media_type=asset.content_type, headers=headers)




@app.get("/{filename:path}")
async def get_site(filename):
    if filename.strip() == '' or filename.strip() == '/':
        filename = 'index.html'
    filename = os.path.join(os.getcwd(), 'template', 'dist', filename)
    print(filename)

    if not(os.path.exists(filename) and os.path.isfile(filename)):
        return Response(status_code=404)

    with open(filename, encoding="utf-8") as f:
        content = f.read()

    content_type, _ = guess_type(filename)
    return Response(content, media_type=content_type)
