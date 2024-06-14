import { FastifyInstance } from "fastify";
import { $ref } from "../../schemas/user.schema";
import { deleteUser, loginHandler, logoutHandler, readUser, register, searchUser, updateUser, verify } from "../../controllers/user/user.c";




async function userRoute(server: FastifyInstance) {
    server.post("/register",{
        schema:{
            body: $ref("regis"),
            tags: ["auth"]
        }
    },register)

    server.post("/verify/:token",{
        schema: {
            tags: ["auth"]
        }
    },verify)

    server.post("/login", {
        schema: {
            tags: ["auth"],
            body: $ref("loginsch")
        }
    },loginHandler)

    server.get("/current",{
        schema:{
            tags:["user"],
        },
        preHandler: [server.authenticate]
    },readUser)

    server.delete("/logout",{
        schema:{
            tags:["auth"]
        },
        preHandler: [server.authenticate]
    },logoutHandler)

    server.delete("/user/delete",{
        schema:{
            tags:["user"]
        },
        preHandler: [server.authenticate]
    },deleteUser)

    server.get("/user/:id",{
        schema: {
            tags: ["user"]
        },
        preHandler: [server.authenticate]
    },searchUser)

    server.patch("/user/update", {
        schema:{
            body: $ref("updaUser"),
            tags:["user"],
        },
        preHandler: [server.authenticate]
    },updateUser)
}


export default userRoute