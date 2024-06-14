import { FastifyInstance } from "fastify";
import { $ref } from "../../schemas/comments.schema";
import { createKomen, delKomen, sKomen, updKomen } from "../../controllers/comments/comments.c";


async function commentRoutes(server: FastifyInstance) {
    server.post("/comment/create", {
        schema: {
            body: $ref("msgF"),
            tags: ["comments"]
        },
        preHandler: [server.authenticate]
    },createKomen)

    server.delete("/comment/delete/:id",{
        schema: {tags: ["comment"]},
        preHandler: [server.authenticate]
    },delKomen)

    server.put("/comment/update/:id",{
        schema: {tags: ["comment"],body: $ref("msgF")},
        preHandler: [server.authenticate]
    },updKomen)

    server.get("/comments/:id",{
        schema: {tags: ["comments"]},
        preHandler: [server.authenticate]
    },sKomen)
}

export default commentRoutes