import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

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
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex(TABLE)
      .where('session_id', sessionId)
      .select()

    return { transactions }
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex(TABLE)
        .where({ session_id: sessionId })
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { params } = request
    const { sessionId } = request.cookies

    const { id } = getTransactionsParamsSchema.parse(params)

    const transaction = await knex(TABLE)
      .where({
        id,
        session_id: sessionId,
      })
      .first()

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

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const id = randomUUID()

    await knex(TABLE).insert({
      id,
      title,
      amount,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
