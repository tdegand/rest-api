'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require("sequelize")
const { User, Course } = require('./models');
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

  function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
      } catch(error){
        res.status(500).send(error);
      }
    }
  }

// Get the currently Authenticated user
app.get('/api/users', asyncHandler(async(req, res) => {
  try {
     await User.findByPk(req.params.id).then(user => {
      res.status(200)
      res.json({ user })
  })
  } catch(error) {
      res.status(404)
      res.json({ error })
  }
}));

// Creates a user, sets the Location header to "/", and returns no content
app.post('/api/users', asyncHandler(async(req, res) => {
    try{
      res.status(201)
      await User.create({  firstname: req.body.firstName, lastName: req.body.lastName, emailAddress: req.body.emailAddress, password: req.body.password })
    }catch(error) {
      res.status(400)
      res.json({ error });
      
    }
}));

// Returns a list of courses (including the user that owns each course)
app.get('/api/courses', asyncHandler(async(req, res) => {
  try {
     await Course.findAll().then(course => {
       res.status(200)
       res.json({ course })
     })
  } catch(error) {
      res.status(404)
      res.json({ error })
  }
}));

// Returns the course (including the user that owns the course) for the provided course ID
app.get('/api/courses/:id', asyncHandler(async(req, res) => {
  try {
     await Course.findByPk(req.params.id).then(course => {
      res.status(200)
      res.json({ course })
  })
  } catch(error) {
      res.status(404)
      res.json( {
        message: "Sorry something went wrong"
      },
      { error })
    }
  }))


// Creates a course, sets the Location header to the URI for the course, and returns no content
app.post('/api/courses', asyncHandler(async(req, res) => {
  try{
    res.status(201)
    await Course.create({  title: req.body.title, description: req.body.description, estimatedTime: req.body.estimatedTime, materialsNeeded: req.body.materialsNeeded })
  }catch(error) {
    res.status(400)
    res.json( {
      message: "Sorry something went wrong"
    },
    { error })
  }
}));

// Updates a course and returns no content
app.put('/api/courses/:id', asyncHandler(async(req, res) => {
  try{
    res.status(204)
    await Course.update({  title: req.body.title, description: req.body.description, estimatedTime: req.body.estimatedTime, materialsNeeded: req.body.materialsNeeded }, {
      where: {
        id: req.params.id
      }
    })
  }catch(error) {
    res.status(400)
    res.json({ error });
  }
}));

// deletes a course and returns no content
app.delete('/api/courses/:id', asyncHandler(async(req, res) => {
  try{
    await Course.destroy({
      where: {
        id: req.params.id
      }
    })
    res.status(204)
  } catch(error) {
    res.status(400)
    res.json( {
      message: "Sorry something went wrong"
    },
    { error })
  }
  
}));

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
