import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
})

const TABLE = 'transactions'

export async function transactionRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const { body } = request

    const {
      amount: rawAmount,
      title,
      type,
    } = createTransactionBodySchema.parse(body)

    const amount = type === 'credit' ? rawAmount : rawAmount * -1

    await knex(TABLE).insert({
      id: randomUUID(),
      title,
      amount,
    })

    return reply.status(201).send()
  })
}
