import { app } from './app'

const PORT = process.env.SERVER_PORT
const HOST = process.env.SERVER_HOST

app.listen(PORT, () => {
  console.info(`Server running on ${PORT}, http://${HOST}:${PORT}`)
})
