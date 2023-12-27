import 'dotenv/config'
import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

const databaseUrl = env.DATABASE_URL
const databaseClient = env.DATABASE_CLIENT

const connection =
  databaseClient === 'sqlite' ? { filename: databaseUrl } : databaseUrl

export const config: Knex.Config = {
  client: databaseClient,
  connection,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
