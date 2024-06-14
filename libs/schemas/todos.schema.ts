import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";



const data = {
    title: z.string(),
    description: z.string()
}

const AdNot = z.object({
    ...data
})


const updaTodos = z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable()
})


export type todosInp = z.infer<typeof AdNot>
export type todoUInp = z.infer<typeof updaTodos>

const models = {
    AdNot,
    updaTodos
}

export const {schemas: todosSchema, $ref} = buildJsonSchemas(models, {$id: 'todosSchema'})
