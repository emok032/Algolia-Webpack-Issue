import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as compression from 'compression';
import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as mongo from 'connect-mongo';
import * as mongoose from 'mongoose';
import * as expressValidator from 'express-validator';
import * as bluebird from 'bluebird';
import config from './api/config/config';
import { apexRestProxyRouter } from './api/routes/apexRestProxyRouter';

console.log(config);

const MongoStore = mongo(session);

enableProdMode();

const app = express();

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URI || config.MONGODB_URI_LOCAL;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, {useMongoClient: true}).then(
  () => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    console.log('Connected to Database');
  },
).catch(err => {
  console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
  // process.exit();
});

const PORT = process.env.PORT || 3000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack

let main = null;

if (process.env.MODE_ENV === 'development') {
  main = require('./dist/server/main');
} else if(process.env.MODE_ENV === 'production'){
  main = require('./server/main');
}

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = main;

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// Example Express Rest API endpoints

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/services/apexrest/', apexRestProxyRouter);

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

let logErrors = function (err, req, res, next) {
  console.error(err.stack);
}

let clientErrorHandler = function(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    next(err);
  }
}

let errorHandler = function(err, req, res, next) {
  res.status(500).json({ error: err });
}

// Define Error Handlers
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));

app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});