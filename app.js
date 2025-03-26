var createError = require('http-errors');
var express = require('express');
require('dotenv').config()
const loaders = require('./loaders/index');
const { handleErrorResponse } = require('./utils/response');


var app = express();
//Load app
(async () => {
  await loaders(app);
})();


app.use(handleErrorResponse)

module.exports = app;
