const http = require('http')
var express = require('express');
require('dotenv').config()
const loaders = require('./loaders/index');
const { handleErrorResponse } = require('./utils/response');

var app = express();
const server = http.createServer(app);
//Load app
(async () => {  
  await loaders(app,server);
})();

module.exports = { app, server };
