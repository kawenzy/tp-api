import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";


const msgF = z.object({
    comment: z.string()
})

export type msgInp = z.infer<typeof msgF>

const models = {
    msgF
}


export const {schemas: commentSchema, $ref} = buildJsonSchemas(models, {$id: 'commentSchema'})