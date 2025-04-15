
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
var logger = require('morgan');
const cookieParser = require("cookie-parser");
var path = require('path');
const session = require("express-session");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require("../swagger/swaggerConfig");
const middlewareLoader = (app) => {
  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET, 
    resave: false,
    saveUninitialized: false
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(helmet());
  app.use(compression())
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials:true,
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
    allowedHeaders: ["Content-type","Authorization"]
  }));
  console.log("Middleware loaded");
};

module.exports = middlewareLoader;
