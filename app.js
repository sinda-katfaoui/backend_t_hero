var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');

require('dotenv').config();
const { connectToMongoDB } = require('./config/db');

var usersRouter        = require('./routes/users.routes');
var signalementsRouter = require('./routes/signalements.routes');
var categoriesRouter   = require('./routes/categories.routes');
var notificationsRouter = require('./routes/notifications.routes');
var analyseAIRouter    = require('./routes/analyseAI.routes');

var app = express();

/* Middlewares */
app.use(logger('dev'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Routes */
app.use('/users',       usersRouter);
app.use('/signalements', signalementsRouter);
app.use('/categories',  categoriesRouter);
app.use('/notifications', notificationsRouter);
app.use('/analyseAI',   analyseAIRouter);

/* Catch 404 */
app.use(function (req, res) {
  res.status(404).json({ message: "Route not found" });
});

/* Error handler */
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
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