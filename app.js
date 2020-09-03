'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require("sequelize")
const { models } = require('./models');
const { body } = require('express-validator');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

//setup sequelize instance
const sequelize = new Sequelize({
	dialect: 'sqlite',
  storge: './fsjstd-restapi.db',
  logging: false
})

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Get the currently Authenticated user
app.get('/api/users', (req, res) => {

});

// Creates a user, sets the Location header to "/", and returns no content
app.post('/api/users', (req, res) => {

})

// Returns a list of courses (including the user that owns each course)
app.get('/api/courses', (req, res) => {

});

// Returns the course (including the user that owns the course) for the provided course ID
app.get('/api/courses/:id', [
    body()
], (req, res) => {

});

// Creates a course, sets the Location header to the URI for the course, and returns no content
app.post('/api/courses', (req, res) => {

});

// Updates a course and returns no content
app.put('/api/courses/:id', (req, res) => {

});

// deletes a course and returns no content
app.delete('/api/courses/:id', (req, res) => {

});

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
