'use strict'

import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { userSchemas } from "./libs/schemas/user.schema";
import fastifyJwt, { FastifyJWT, JWT } from "@fastify/jwt";
import fastifyMiddie from "@fastify/middie";    
import fastifyHelmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import zlib from "zlib"
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCompress from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import userRoute from "./libs/routers/user/user.r";
import { todosSchema } from "./libs/schemas/todos.schema";
import todosRoute from "./libs/routers/todos/todos.r";
import { commentSchema } from "./libs/schemas/comments.schema";
import commentRoutes from "./libs/routers/comments/comment.r";

export const app = fastify()

const token = "3RilmTZP19sIYX4HOyO7e1t2lJxzqxRSgMKPZFp1xl-EoCK51Rx8SA3N0XElO4aQ"

declare module "fastify" {
    export interface FastifyInstance{
        authenticate: any
    }
    interface FastifyRequest{
        jwt: JWT;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            uuid: string
            name: string
            email: string
        }
    }
}


async function main(): Promise<void> {
    app.register(fastifyMiddie)
    app.register(fastifyHelmet, {contentSecurityPolicy: true, xXssProtection: true, global: false})
    app.register(fastifySwagger)
    app.register(fastifySwaggerUi, {
        prefix: '/docs',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: true
        },
    })
    app.register(fastifyCompress, {
        threshold: 2000,
        encodings: ["deflate", "gzip"],
        requestEncodings: ["gzip", "deflate"],
        global: false,
        brotliOptions: {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 4
            }
        }
    })

    for (const schemas of [
        ...userSchemas,
        ...todosSchema,
        ...commentSchema
    ]){
        app.addSchema(schemas)
    }
    app.register(fastifyJwt, {
        secret: token
    })

    app.register(fastifyCookie, {
        hook: "preHandler",
        secret: token, parseOptions: { priority: "high" }
    })

    app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
        const tokan = request.cookies.token
        if (!tokan) {
            return reply.code(401).send({ msg: "authenticatin is required" })
        }
        const decode = request.jwt.verify<FastifyJWT['user']>(tokan)
        request.user = decode
    })

    app.addHook("preHandler", (req, reply, next) => {
        req.jwt = app.jwt;
        return next();
    });

    for(const route of [userRoute,todosRoute,commentRoutes]){
        app.register(route, { prefix: "/api/v1" })
    }

    try{
        await app.listen({port: 3000, host: "0.0.0.0"})
        console.log(`
            server is running:  http://127.0.0.1:3000/ 🍵☕
            `)     
    }catch(e) {
        console.error(e)
        process.exit(1)
    }
}

main()