import { randomUUID } from 'crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/transactions', async () => {
    const transaction = await knex('transactions')
      .insert({
        id: randomUUID(),
        title: ' transacao de teste',
        amount: 1000,
      })
      .returning('*')

    return transaction
  })
}
