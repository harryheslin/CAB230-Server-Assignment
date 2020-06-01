require("dotenv").config({});
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUI = require('swagger-ui-express');
yaml = require('yamljs');
const swaggerDocument = yaml.load('./docs/swagger.yaml');
const helmet = require('helmet');
const cors = require('cors');

const usersRouter = require('./routes/users');
const stocksRouter = require('./routes/stocks');
const authenticatedRouter = require('./routes/authed');

const app = express();


//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('common'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const options = require("./knexfile.js");
const knex = require('knex')(options);

app.use((req, res, next) => {
  req.db = knex
  next()
})

//Logging
logger.token("req", (req, res) => JSON.stringify(req.headers))
logger.token("res", (req, res) => {
  const headers = {}
  res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)))
  return JSON.stringify(headers)
})


//App routers
app.use('/', swaggerUI.serve);
app.get('/', swaggerUI.setup(swaggerDocument))
app.use('/user', usersRouter);
app.use('/stocks', stocksRouter);
app.use('/stocks/authed', authenticatedRouter)

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
