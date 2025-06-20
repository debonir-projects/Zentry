import 'dotenv/config'
import express from 'express'
import { clerkClient, clerkMiddleware, getAuth, requireAuth } from '@clerk/express'

const app = express()
const PORT = 3002

app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!')
})

// Use requireAuth() to protect this route
// If user is not authenticated, requireAuth() will redirect back to the homepage
app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  // or you can use `req.auth`
  const { userId } = getAuth(req)

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  res.json({ user })
})

// Assuming you have a template engine installed and are using a Clerk JavaScript SDK on this page
app.get('/sign-in', (req, res) => {
  res.render('sign-in')
})

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
