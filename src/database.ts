import 'dotenv/config'
import { knex as setupKnex, Knex } from 'knex'

const databaseFilename = process.env.DATABASE_URL

if (!databaseFilename) {
  throw Error('Database file not specified')
}

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
