const express = require('express');
const mongoose = require('mongoose');
const validate = require('express-validation');
const Youch = require('youch');
const Sentry = require('@sentry/node');
const router = require('./router');
const databaseConfig = require('./config/database');
const sentryConfig = require('./config/sentry');

class App {
  constructor() {
    this.express = express();
    this.isDev = process.env.NODE_ENV !== 'production';
    this.sentry();
    this.database();
    this.middlewares();
    this.routes();
    this.exception();
  }

  sentry() {
    Sentry.init(sentryConfig);
  }

  database() {
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true,
      useNewUrlParser: true,
    });
  }

  middlewares() {
    this.express.use(Sentry.Handlers.requestHandler());
    this.express.use(express.json());
  }

  routes() {
    this.express.use(router);
  }

  exception() {
    if (process.env.NODE_ENV === 'production') {
      this.express.use(Sentry.Handlers.errorHandler());
    }
    // eslint-disable-next-line no-unused-vars
    this.express.use(async (err, req, res, next) => {
      if (err instanceof validate.ValidationError) {
        return res.status(err.status).json(err);
      }

      if (process.env.NODE_ENV !== 'production') {
        const youch = new Youch(err, req);
        return res
          .status(err.status || 500)
          .json(await youch.toJSON());
      }

      return res
        .status(err.status || 500)
        .json({ error: 'Internal Server Error' });
    });
  }
}

module.exports = new App().express;
