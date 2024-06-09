from fastapi.responses import JSONResponse,RedirectResponse
from fastapi.requests import Request
import json
from fastapi import Body, status,HTTPException
from passlib.context import CryptContext
from scripts.schema import User,Logins,UpdUser
from scripts.utils import totp, mails,prisma,curruser
from json_build import JSON_Object
from typing import Annotated
import jwt


async def createaccount(user: Annotated[User, Body(embed=True)],req: Request):
    allowed_extensions = str(["png", "jpg", "gif"])
    splis = user.imgurl.split(".").pop()
    otp = totp()
    #cara sendiri
    if splis not in allowed_extensions.join(splis):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "Invalid image extension"})
    if len(str(user.password)) < 6 :
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "password is required 6 length minimals"})
    #cara ai
    # allowed_extensions = ["png", "jpg", "gif"]
    # extension = os.path.splitext(user.imgurl)
    # if not extension[1:] in allowed_extensions:
    #     return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "Invalid image extension"})
    chcekemail = await prisma.user.find_unique(where={"email": user.email})
    if chcekemail:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "already email"})
    cook = req.cookies.get("otp")
    if cook:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "wait a 5 minutes, and try create account again"})
    # await mails(otp=otp, email=user.email)
    data = {
        "token": otp,
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "imgurl": user.imgurl
    }
    await prisma.side.create(data=data)
    response = {
        "msg": f"lets go verification in: http:127.0.0.1/api/v1/verify/{otp}"
    }
    json_response = JSONResponse(status_code=status.HTTP_200_OK, content=response)
    json_response.set_cookie(key="otp", value=otp, expires=3600)
    
    return json_response
    

async def verify(req: Request, token: str):
    otp = req.cookies.get("otp")
    if not otp:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT,content={"msg": "not token found to your account verify"})
    if token != otp:
        return JSONResponse(status_code=status.HTTP_406_NOT_ACCEPTABLE,content={"msg": "token is invalid"})
    data = await prisma.side.find_unique(where={"token":otp})
    if not data:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "invalid"})
    await prisma.side.delete_many(where={"email": data.email})
    pw = CryptContext(schemes=["sha256_crypt"])
    pw.default_scheme()
    user = {
        "name": data.name,
        "email": data.email,
        "password": pw.hash(data.password),
        "imgurl": data.imgurl
    }
    await prisma.user.create(data=user)
    respon = JSONResponse(status_code=status.HTTP_202_ACCEPTED, content={"msg": "verification succes"})
    respon.delete_cookie("otp")
    return respon

def tokens(payload: dict, secret: str, algo: str):
    return jwt.encode(payload=payload,key=secret,algorithm=algo)

async def login(req: Request, user: Logins):
    SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM = "HS256"
    checktoken = await prisma.user.find_unique(where={"email": user.email})
    if checktoken.token:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "already login"})
    chekcookies = req.cookies.get("token")
    if chekcookies:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "already login"})
    pw = CryptContext(schemes=["sha256_crypt"])
    pw.default_scheme()
    users = await prisma.user.find_unique(where={"email": user.email})
    if not users:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"msg": "user not found"})
    passw = pw.verify(user.password, users.password)
    if not passw:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "password is wrong"})
    payload = {
        "uuid": users.uuid,
        "name": users.name,
        "email": users.email
    }
    token = tokens(payload=payload,secret=SECRET_KEY,algo=ALGORITHM)
    await prisma.user.update(where={"email": user.email},data={"token":token})
    resp = JSONResponse(status_code=status.HTTP_200_OK,content={"msg": "login succes"})
    resp.set_cookie("token",value=token)
    return resp


async def logout(req: Request):
    token = req.cookies.get("token")
    if not token:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "invalid token"})
    find = await prisma.user.find_many(where={"token": token})
    if not find:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "invalid token"})
    curr = curruser(req=req)
    uuid = curr["uuid"]
    await prisma.user.update(where={"uuid": uuid},data={"token": None})
    respon = JSONResponse(status_code=status.HTTP_200_OK,content={"msg": "logout succes"})
    respon.delete_cookie("token")
    return respon


async def read_user(req: Request):
    token = req.cookies.get("token")
    if not token:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is required"})
    find = await prisma.user.find_many(where={"token": token})
    if not find:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is required"})
    curr = curruser(req=req)
    return JSONResponse(status_code=status.HTTP_200_OK,content=curr)


async def search_user(req: Request, ids: str):
    token = req.cookies.get("token")
    if not token:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is required"})
    find = await prisma.user.find_many(where={"token": token})
    if not find:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is required"})
    users = await prisma.user.find_unique(where={"uuid": ids})
    data = {
        "uuid": users.uuid,
        "name": users.name,
        "email": users.email,
        "imgurl": users.imgurl
    }
    respon = JSONResponse(status_code=status.HTTP_200_OK, content=data)
    return respon


async def upduser(req: Request, body:Annotated[UpdUser, Body(embed=True)]):
    token = req.cookies.get("token")
    if not token:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is required"})
    find = await prisma.user.find_many(where={"token": token})
    if not find:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is requiired"})
    curr = curruser(req=req)
    allowed_extensions = str(["png", "jpg", "gif"])
    splis = body.imgurl.split(".").pop()
    user = curr["uuid"]
    data = {}
    if body.name is not None:
        data["name"] = body.name
    if body.email is not None:
        chcekemail = await prisma.user.find_unique(where={"email": body.email})
        if chcekemail:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "already email"})
        data["email"] = body.email
    if body.imgurl is not None:
        if splis not in allowed_extensions.join(splis):
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "Invalid image extension"})
        data["imgurl"] = body.imgurl
    if body.password is not None:
        if len(str(body.password)) < 6 :
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "password is required 6 length minimals"})
        pw = CryptContext(schemes=["sha256_crypt"])
        pw.default_scheme()
        data["password"] = pw.hash(body.password)
    await prisma.user.update(data=data,where={"uuid":user})
    return JSONResponse(status_code=status.HTTP_200_OK, content={"msg": "success update user"})

async def delakun(req: Request):
    token = req.cookies.get("token")
    if not token:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is required"})
    find = await prisma.user.find_many(where={"token": token})
    if not find:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "login is required"})
    cuur = curruser(req=req)
    user = cuur["uuid"]
    await prisma.user.delete(where={"uuid":user})
    respon = JSONResponse(status_code=status.HTTP_200_OK,content={"msg": "delete account succes"})
    respon.delete_cookie("token")
    return respon