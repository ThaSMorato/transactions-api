import 'dotenv/config'
import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

const databaseFilename = env.DATABASE_URL

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: databaseFilename,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
