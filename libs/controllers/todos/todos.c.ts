import { FastifyReply, FastifyRequest } from "fastify";
import { todosInp, todoUInp } from "../../schemas/todos.schema";
import prisma from "../../utils/prisma";



export async function addNote(req: FastifyRequest<{
    Body: todosInp
}>, rply: FastifyReply): Promise<never> {
    const { title, description } = req.body
    const cook: string | undefined = req.cookies.token
    if (!cook) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const chek = await prisma.user.findMany({ where: { token: cook } })
    if (!chek) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const user = req.user
    let data = {
        authorId: user.uuid,
        title: title,
        description: description
    }
    await prisma.todos.create({ data: data })
    return rply.code(200).send({ "msg": "create todos succesfully" })
}


export async function delNote(req: FastifyRequest<{
    Params: { id: number }
}>, rply: FastifyReply): Promise<never> {
    const id: number = req.params.id
    const cook: string | undefined = req.cookies.token
    if (!cook) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const chek = await prisma.user.findMany({ where: { token: cook } })
    if (!chek) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const user = req.user
    const valid = await prisma.todos.findUnique({ where: { id: id } })
    if (!valid) {
        return rply.code(404).send({ "msg": "todos not found" })
    }
    if (valid.authorId != user.uuid) {
        return rply.code(403).send({ "msg": "not yours" })
    }
    await prisma.todos.delete({ where: { id: id } })
    return rply.code(200).send({ "msg": "delete todos succesfully" })
}

export async function curNote(req: FastifyRequest<{
    Querystring: { n: number }
}>, rply: FastifyReply): Promise<never> {
    const n: number = req.query.n
    const cook: string | undefined = req.cookies.token
    const limit: number = 10
    const skip: number = (n - 1) * limit
    if (!cook) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const chek = await prisma.user.findMany({ where: { token: cook } })
    if (!chek) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const user = req.user
    const todos = await prisma.todos.findMany({ where: { authorId: user.uuid }, orderBy: { createdAt: "desc" }, skip: skip, take: limit })
    if (!todos) {
        return rply.code(204).send({ "msg": "todos not found" })
    }
    let notes: any[] = []
    for (const data of todos) {
        notes.push({
            id: data.id,
            authorId: data.authorId,
            title: data.title,
            description: data.description,
            createdAt: data.createdAt
        })
    }
    return rply.code(200).send(notes)
}

export async function searchNotes(req: FastifyRequest<{
    Querystring: { q: string }
}>, rply: FastifyReply): Promise<never> {
    const q: string = req.query.q
    const cook: string | undefined = req.cookies.token
    if (!cook) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const chek = await prisma.user.findMany({ where: { token: cook } })
    if (!chek) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const todos = await prisma.todos.findMany({
        where: {
            OR: [
                { title: { startsWith: q } },
                { title: { endsWith: q } },
                { title: { contains: q } },
            ]
        }, orderBy: { createdAt: "desc" }
    })
    if (!todos) {
        return rply.code(404).send({ "msg": "todos not found" })
    }
    let notes: any[] = []
    for (const data of todos) {
        notes.push({
            id: data.id,
            authorId: data.authorId,
            title: data.title,
            description: data.description,
            createdAt: data.createdAt
        })
    }
    return rply.code(200).send(notes)
}


export async function sidNotes(req: FastifyRequest<{
    Params: { id: number }
}>, rply: FastifyReply): Promise<never> {
    const id: number = req.params.id
    const cook: string | undefined = req.cookies.token
    if (!cook) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const chek = await prisma.user.findMany({ where: { token: cook } })
    if (!chek) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const todos = await prisma.todos.findUnique({ where: { id: id } })
    if (!todos) {
        return rply.code(404).send({ "msg": "todos not found" })
    }
    return rply.code(200).send(todos)
}

export async function updatedNote(req: FastifyRequest<{
    Params: { id: number }
    Body: todoUInp
}>, rply: FastifyReply): Promise<never> {
    const { title, description } = req.body
    const id: number = req.params.id
    const cook: string | undefined = req.cookies.token
    if (!cook) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const check = await prisma.user.findMany({ where: { token: cook } })
    if (!check) {
        return rply.code(401).send({ "msg": "login is required" })
    }
    const find = await prisma.todos.findUnique({ where: { id: id } })
    const user = req.user
    if (find?.authorId != user.uuid) {
        return rply.code(400).send({ "msg": "not yours" })
    }
    let data: any
    if (title != null) {
        data = {
            title: title
        }
    }
    if (description != null) {
        data = {
            description: description
        }
    }
    await prisma.todos.update({ where: { id: id }, data: data })
    return rply.code(200).send({ "msg": "updated succes" })
}