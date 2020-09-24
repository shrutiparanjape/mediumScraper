var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const scraperController = require('./controller/scraper');
const getUrlsController = require('./controller/getUrls');

var app = express();

const port = process.env.PORT || 3001;

// DB connection
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://root:root@cluster0.1kjiy.mongodb.net/medium', { useNewUrlParser: true }).then(data => {

// mongoose.connect('mongodb://mongo:27017/medium', { useNewUrlParser: true }).then(data => {
  console.log("Successfully connected to DB")
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API end points
app.get('/', function (req, res) {
  res.json({
      'API': 'Web Scraping of https://medium.com/'
  });
});
app.get('/api/startScraping', scraperController.startScraping);
app.get('/api/getUrls', getUrlsController.getUrls);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Send the error 
  res.status(err.status || 500);
  res.json({'error': 'Error in API'});
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});

module.exports = app;
