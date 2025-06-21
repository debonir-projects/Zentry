import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'
import authRoutes from './routes/auth/auth'
import userRoutes from './routes/auth/postUser'
import webhookRoutes from './webhooks/index.js'
import routes from './routes/index' // Import the transaction routes

const app = express()
const PORT = 3000

// Apply raw body parser specifically to the webhook route BEFORE other middleware
app.use('/api/webhooks/clerk', express.raw({ type: 'application/json' }))

// Then apply general middleware for other routes
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!')
})

// Use auth routes
app.use('/auth', authRoutes)

// User routes
app.use('/api/postUser', userRoutes)
app.use('/api/webhooks', webhookRoutes)

// Add transaction routes
app.use('/api', routes.router)

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
