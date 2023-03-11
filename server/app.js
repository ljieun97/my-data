const express = require('express')
const cors = require('cors')
const mongo = require('./utils/mongodb')
const app = express()

// port
app.set('port', process.env.PORT || 3000)

// Access-Control-Allow-Origin
app.use(cors())

// request body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))

// routes
const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')
const apiDataRouter = require('./routes/api-data-route')
const myMovieRouter = require('./routes/my-movie-route')
app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/api-data', apiDataRouter)
app.use('/my-movie', myMovieRouter)

// connect to MongoDB
mongo()

// 포트 기동
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트 기동')
})

module.exports = app