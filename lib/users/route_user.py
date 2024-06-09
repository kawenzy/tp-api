from fastapi import APIRouter
from scripts.schema import User,Logins,UpdUser
from . import createaccount,verify, login,logout,read_user, search_user,upduser,delakun
from fastapi.requests import Request

userRoute =  APIRouter()

@userRoute.post("/register",tags=["auth"])
async def register(user: User,req: Request):
    sign = await createaccount(user=user,req=req)
    return sign

@userRoute.post("/verify/{token}",tags=["auth"])
async def verifys(token: str,req: Request):
    v = await verify(req=req, token=token)
    return v

@userRoute.post("/login", tags=["auth"])
async def logins(req: Request,user: Logins):
    v = await login(req=req, user=user)
    return v

@userRoute.delete("/logout", tags=["auth"])
async def logouts(req: Request):
    v = await logout(req)
    return v

@userRoute.get("/user",tags=["users"])
async def get_user(req: Request):
    v = await read_user(req)
    return v

@userRoute.get("/users/{id}", tags=["users"])
async def get_users(id: str, req: Request):
    v = await search_user(ids=id, req=req)
    return v

@userRoute.patch("/user/update",tags=["users"])
async def update_user(upd: UpdUser, req: Request):
    v = await upduser(body=upd, req=req)
    return v

@userRoute.delete("/user/delete",tags=["users"])
async def delete_user(req: Request):
    v = await delakun(req=req)
    return v