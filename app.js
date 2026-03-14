var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');

require('dotenv').config();
const { connectToMongoDB } = require('./config/db');


var usersRouter = require('./routes/users.routes');
var signalementsRouter = require('./routes/signalements.routes');
var categoriesRouter = require('./routes/categories.routes');
var notificationsRouter = require('./routes/notifications.routes');
var analyseAIRouter = require('./routes/analyseAI.routes');

var app = express();

/* Middlewares */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Routes */

app.use('/users', usersRouter);
app.use('/signalements', signalementsRouter);
app.use('/categories', categoriesRouter);
app.use('/notifications', notificationsRouter);
app.use('/analyseAI', analyseAIRouter);

/* Catch 404 */
app.use(function (req, res, next) {
  next(createError(404));
});

/* Error handler */
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

/* Server */
const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});