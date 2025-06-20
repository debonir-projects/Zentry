import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'
import authRoutes from './routes/auth/auth'
import userRoutes from './routes/auth/postUser' // Import the user routes
import webhookRoutes from './webhooks/index.js';

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!')
})

app.use('/api/webhooks/clerk', express.raw({ type: 'application/json' }))

// Use auth routes
app.use('/auth', authRoutes)

// User routes
app.use('/api/postUser', userRoutes)
app.use('/api/webhooks', webhookRoutes)
// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
