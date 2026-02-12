import express from 'express'
import connectDB from './config/db.js'
import 'dotenv/config'
import cors from 'cors'
import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js'


const app = express()
const port = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// DB Connect
connectDB();

// ROUTES
app.use('/api/user', userRouter)
app.use('/api/tasks', taskRouter)

app.get('/', (req, res) => {
  res.send('API Working')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});


