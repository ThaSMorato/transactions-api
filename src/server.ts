import fastify from 'fastify'
import { env } from './env'
import { routes } from './routes'
import cookie from '@fastify/cookie'

const port = env.PORT

const app = fastify()

app.register(cookie)

app.register(routes)

app.listen({ port }).then(() => console.log('HTTP Server Running'))
