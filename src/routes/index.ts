import { transactionRoutes } from './transactions'
import { FastifyInstance } from 'fastify'

export async function routes(app: FastifyInstance) {
  app.register(transactionRoutes)
}
