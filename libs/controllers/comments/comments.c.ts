import { FastifyReply, FastifyRequest } from "fastify";
import { msgInp } from "../../schemas/comments.schema";
import prisma from "../../utils/prisma";


export async function createKomen(req: FastifyRequest<{
    Body: msgInp,
    Params: {id: number}
}>, rply: FastifyReply): Promise<never> {
    const { comment } = req.body
    const id: number = req.params.id
    const user = req.user
    const cook: string | undefined = req.cookies.token
    if (!cook) { return rply.status(401).send({ "msg": "login is required" }) }
    const find = await prisma.user.findMany({ where: { token: cook } })
    if (!find) { return rply.code(401).send({ "msg": "login is required" }) }
    const data = {
        authorId: user["uuid"],
        comment: comment,
        todoId: id
    }
    await prisma.comments.create({data:data})
    return rply.code(200).send({"msg": "create succes"})
}


export async function delKomen(req: FastifyRequest<{
    Params: {id: number}
}>, rply: FastifyReply): Promise<never> {
    const id: number = req.params.id
    const cook: string | undefined = req.cookies.token
    if (!cook) { return rply.status(401).send({ "msg": "login is required"})}
    const find = await prisma.user.findMany({ where: { token: cook } })
    if (!find) { return rply.code(401).send({ "msg": "login is required"})}
    const user = req.user
    const check = await prisma.comments.findUnique({where: {id:id}})
    if(check?.authorId != user["uuid"]){
        return rply.code(403).send({"msg": "you are not the author of this"})
    }
    await prisma.comments.delete({where: {id:id}})
    return rply.code(200).send({"msg": "delete succes"})
}

export async function updKomen(req: FastifyRequest<{
    Body: msgInp,
    Params: {id: number}
}>, rply: FastifyReply): Promise<never> {
    const { comment } = req.body
    const id: number = req.params.id
    const cook: string | undefined = req.cookies.token
    if (!cook) { return rply.status(401).send({ "msg": "login is required"})}
    const find = await prisma.user.findMany({ where: { token: cook } })
    if (!find) { return rply.code(401).send({ "msg": "login is required"})}
    const chek = await prisma.comments.findUnique({where: {id: id}})
    if(!chek) {
        return rply.code(404).send({"msg": "comment not found"})
    }
    const user =req.user
    if(chek.authorId != user["uuid"]) {
        return rply.code(403).send({"msg": "you are not the author of this"})
    }
    await prisma.comments.update({where: {id: id}, data: {comment: comment}})
    return rply.code(200).send({"msg": "update succes"})
}


export async function sKomen(req: FastifyRequest<{
    Params: {id: number}
}>, rply: FastifyReply): Promise<never> {
    const id: number = req.params.id
    const cook: string | undefined = req.cookies.token
    if(!cook) {
        return rply.code(401).send({"msg": "login is required"})
    }
    const find = await prisma.user.findMany({where: {token:  cook}})
    if(!find) {
        return rply.code(401).send({"msg": "login is required"})
    }
    const komen = await prisma.comments.findMany({where: {todoId: id},orderBy: {createdAt: "desc"}})
    if(!komen) {
        return rply.code(204).send({"msg": "comment not found"})
    }
    let data: any[] =  []
    for(const datas of komen) {
        data.push({
            id: datas.id,
            comment: datas.comment,
            createdAt: datas.createdAt,
            authorId: datas.authorId,
            todoId: datas.todoId
        })
    }
    return rply.code(200).send(data)
}