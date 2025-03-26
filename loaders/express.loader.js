const express = require('express');

const expressLoader = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
    console.log("Express init");
};

module.exports = expressLoader; 