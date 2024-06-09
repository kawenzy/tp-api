from fastapi import APIRouter
from fastapi.requests import Request
from scripts.schema import Komen
from . import createmsg,delkomen,updkomen,skomen

comentRoutes = APIRouter()

@comentRoutes.post("/comments/{todos}",tags=["comments"])
async def create_comment(todos: int, request: Request, comment: Komen):
    v = await createmsg(req=request,body=comment, todos=todos)
    return v

@comentRoutes.get("/comments/s/{id}",tags=["comments"])
async def show_comment(id: int,req: Request):
    v = await skomen(id=id,req=req)
    return v

@comentRoutes.put("/comments/update/{id}",tags=["comments"])
async def update_comment(id: int, comment: Komen, req: Request):
    v = await updkomen(id=id,body=comment,req=req)
    return v

@comentRoutes.delete("/comments/delete/{id}",tags=["comments"])
async def delete_comment(id: int, req: Request):
    v = await delkomen(id=id,req=req)
    return v