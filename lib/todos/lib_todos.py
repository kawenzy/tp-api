from scripts.schema import Notes,NoteUpd
from scripts.utils import totp, mails,prisma,curruser
from fastapi import Body, status,HTTPException
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from typing import Annotated


async def addnote(req: Request, body: Annotated[Notes, Body(embed=True)]):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    user = curruser(req=req)
    data = {
        "title": body.title,
        "description": body.description,
        "authorId": user["uuid"]
    }
    await prisma.todos.create(data=data)
    resp = JSONResponse(status_code=status.HTTP_201_CREATED,content={"msg": "creaate is succesfully"})
    return resp

# not pagination
async def curnote(req: Request, n: int): 
    cook = req.cookies.get("token")
    limit = 10
    skip = (n - 1) * limit
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    user = curruser(req=req)
    find = await prisma.todos.find_many(where={"authorId": user["uuid"]},order={"createdAt": "desc"},take=limit,skip=skip)
    if not find:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT,content={"msg": "no todos in you"})
    res = [{
        "author": data.authorId,
        "id": data.id,
        "title": data.title,
        "description": data.description,
        "createdAt": data.createdAt.isoformat(),
    }for data in find]
    return JSONResponse(status_code=status.HTTP_200_OK,content=res)


async def snote(req: Request,id: int):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    note = await prisma.todos.find_unique(where={"id": id})
    data = {
        "author": note.authorId,
        "id": note.id,
        "title": note.title,
        "description": note.description
    }
    return JSONResponse(status_code=status.HTTP_200_OK,content=data)

async def delnote(req: Request, id: int):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    user = curruser(req=req)
    note = await prisma.todos.find_unique(where={"id": id})
    if not note:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT,content={"msg": "not found todos"})
    if note.authorId != user["uuid"]:
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"msg": "not yours"})
    await prisma.todos.delete(where={"id": id})
    return JSONResponse(status_code=status.HTTP_200_OK,content={"msg": "delete success"})


async def updnote(req: Request, id: int,body: Annotated[NoteUpd, Body(embed=True)]):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    user = curruser(req=req)
    note = await prisma.todos.find_unique(where={"id": id})
    if not note:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT,content={"msg": "not found todos"})
    if note.authorId != user["uuid"]:
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"msg": "not yours"})
    data ={}
    if body.title is not None:
        data["title"] = body.title
    if body.description is not None:
        data["description"] = body.description
    if not body:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"msg": "No fields to update"})
    await prisma.todos.update(where={"id": id}, data=data)
    return JSONResponse(status_code=status.HTTP_200_OK,content={"msg": "update success"})
        
async def sallnote(req:Request,title:str):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    notes = await prisma.todos.find_many(where={"OR":[
        {"title": {"startswith": title} },
        {"title": {"endswith": title} },
        {"title": {"contains": title} },
    ]},order={"createdAt": "desc"})
    if not notes:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT,content={"msg": "not found todos"})
    data=[{
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "authorId": item.authorId,
        "createdAt": item.createdAt.isoformat()
    }for item in notes]
    return JSONResponse(status_code=status.HTTP_200_OK,content=data)