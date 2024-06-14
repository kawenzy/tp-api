import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";


const data = {
    name: z.string(),
    email: z.string().email(),
    imgurl: z.string()
}


const regis = z.object({
    ...data,
    password: z.string().min(10),
})

const loginsch = z.object({
    email: z.string().email(),
    password: z.string().min(10),
})


const updaUser = z.object({
    name: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    imgurl: z.string().optional().nullable(),
    password: z.string().min(10).optional().nullable()
})


export type regisInp = z.infer<typeof regis>
export type loginInp = z.infer<typeof loginsch>
export type updInp = z.infer<typeof updaUser>

const models = {
    regis,
    loginsch,
    updaUser
}


export const {schemas: userSchemas, $ref} = buildJsonSchemas(models, {$id: 'userSchemas'})