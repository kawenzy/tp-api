from fastapi import APIRouter
from fastapi.requests import Request
from . import curnote, addnote, snote,delnote,updnote,sallnote
from scripts.schema import Notes,NoteUpd

todosRoute = APIRouter()

@todosRoute.post("/note/create", tags=["notes"])
async def create_note(note: Notes, request: Request):
    v = await addnote(req=request, body=note)
    return v

@todosRoute.get("/notes/p", tags=["notes"])
async def current_notes(request: Request,n: int):
    v = await curnote(req=request,n=n)
    return v

@todosRoute.get("/note/{id}", tags=["notes"])
async def get_note(id: int, request: Request):
    v = await snote(id=id,req=request)
    return  v

@todosRoute.delete("/note/delete/{id}", tags=["notes"])
async def delete_note(id: int, request: Request):
    v = await delnote(id=id,req=request)
    return v

@todosRoute.patch("/note/update/{id}", tags=["notes"])
async def update_note(note: NoteUpd, request: Request, id: int):
    v = await updnote(req=request, body=note,id=id)
    return v

@todosRoute.get("/notes/s",tags=["notes"])
async def search_all_notes(request: Request,title: str):
    v = await sallnote(req=request,title=title)
    return v