const express = require('express');
const app = express();

// port
app.set('port', process.env.PORT || 3000);

// Access-Control-Allow-Origin
var cors = require('cors');
app.use(cors())

// routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const movieRouter = require('./routes/movie');
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/movie', movieRouter);


app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트 기동');
 });

module.exports = app;