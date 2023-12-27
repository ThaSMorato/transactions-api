import { env } from './env'
import { app } from './app'

const port = env.PORT

app.listen({ port }).then(() => console.log('HTTP Server Running'))
