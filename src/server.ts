import fastify from 'fastify'
import { env } from './env'
import { routes } from './routes'

const port = env.PORT

const app = fastify()

app.register(routes)

app.listen({ port }).then(() => console.log('HTTP Server Running'))
