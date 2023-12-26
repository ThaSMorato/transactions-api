import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
})

const getTransactionsParamsSchema = z.object({
  id: z.string().uuid(),
})

const TABLE = 'transactions'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex(TABLE).select()

    return { transactions }
  })

  app.get('/summary', async () => {
    const summary = await knex(TABLE).sum('amount', { as: 'amount' }).first()

    return { summary }
  })

  app.get('/:id', async (request) => {
    const { params } = request

    const { id } = getTransactionsParamsSchema.parse(params)

    const transaction = await knex(TABLE).where('id', id).first()

    return { transaction }
  })

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
