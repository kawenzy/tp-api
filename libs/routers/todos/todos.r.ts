import { FastifyInstance } from "fastify";
import { $ref } from "../../schemas/todos.schema";
import { addNote, curNote, delNote, searchNotes, sidNotes, updatedNote } from "../../controllers/todos/todos.c";


async function todosRoute(server: FastifyInstance) {
    server.post("/notes/create",{
        schema: {
            body: $ref("AdNot"),
            tags: ["notes"]
        },
        preHandler: [server.authenticate]
    },addNote)

    server.delete("/notes/delete/:id",{
        schema: {
            tags: ["notes"]
        },
        preHandler: [server.authenticate]
    },delNote)

    server.get("/notes",{
        schema: {
            tags: ["notes"]
        },
        preHandler: [server.authenticate]
    },curNote)

    server.get("/notes/s",{
        schema: {
            tags: ["notes"]
        },
        preHandler: [server.authenticate]
    },searchNotes)

    server.get("/note/:id",{
        schema: {
            tags: ["notes"]
        },preHandler: [server.authenticate]
    },sidNotes)

    server.patch("/notes/update/:id",{
        schema: {
            body: $ref("updaTodos"),
            tags: ["notes"]
        },
        preHandler: [server.authenticate]
    },updatedNote)
}

export default todosRoute