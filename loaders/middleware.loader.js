
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
var logger = require('morgan');
const cookieParser = require("cookie-parser");
var path = require('path');

const middlewareLoader = (app) => {
  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(helmet());
  app.use(compression())
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors({
    origin: "*", 
    methods: ["GET","Head","PUT","PATCH","POST","DELETE"],
    allowedHeaders: ["Content-type","Authorization"]
  }));
  console.log("Middleware loaded");
};

module.exports = middlewareLoader;
