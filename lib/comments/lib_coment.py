from scripts.schema import Komen
from scripts.utils import totp, mails,prisma,curruser
from fastapi import Body, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from typing import Annotated


async def createmsg(req: Request, body: Annotated[Komen, Body(embed=True)], todos: int):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    user = curruser(req=req)
    data = {
        "authorId": user["uuid"],
        "comment": body.msg,
        "todoId": todos
    }
    await prisma.comments.create(data=data)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content={"msg": "success create comment"})

async def skomen(req: Request, id: int):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    dop = await prisma.comments.find_many(where={"todoId": id},order={"createdAt": "desc"})
    if not dop:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={"msg": "no comment"})
    respon = [{
        "id": data.id,
        "authorId": data.authorId,
        "comment": data.comment,
        "createdAt": data.createdAt,
    }for data in dop]
    return JSONResponse(status_code=status.HTTP_200_OK, content=respon)

async def updkomen(req: Request, id: int, body: Annotated[Komen, Body(embed=True)]):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    user = curruser(req=req)
    dop = await prisma.comments.find_unique(where={"id": id})
    if not dop:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={"msg": "comment not"})
    if dop.authorId != user["uuid"]:
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"msg": "not yours"})
    data = {
        "comment": body.msg
    }
    await prisma.comments.update(where={"id": id}, data=data)
    return JSONResponse(status_code=status.HTTP_200_OK, content={"msg": "success update comment"})
    

async def delkomen(req: Request, id: int):
    cook = req.cookies.get("token")
    if not cook:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "required login"})
    chekdata = await prisma.user.find_many(where={"token": cook})
    if not chekdata:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"msg": "no hack bro"})
    await prisma.comments.delete(where={"id":id})
    return JSONResponse(status_code=status.HTTP_200_OK, content={"msg": "success delete comment"})