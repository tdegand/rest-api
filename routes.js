const express = require('express');
const router = express.Router();
const { User, Course } = require('./models');
const { body } = require('express-validator');

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
router.get('/api/users', asyncHandler(async(req, res) => {
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
router.post('/api/users', asyncHandler(async(req, res) => {
    try{
      res.status(201)
      await User.create({  firstName: req.body.firstName, lastName: req.body.lastName, emailAddress: req.body.emailAddress, password: req.body.password })
    }catch(error) {
      res.status(400)
      res.json({ error });
      
    }
}));

// Returns a list of courses (including the user that owns each course)
router.get('/api/courses', asyncHandler(async(req, res) => {
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
router.get('/api/courses/:id', asyncHandler(async(req, res) => {
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
router.post('/api/courses', asyncHandler(async(req, res) => {
  try{
    res.status(201)
    await Course.create({  title: req.body.title, description: req.body.description, estimatedTime: req.body.estimatedTime, materialsNeeded: req.body.materialsNeeded })
  }catch(error) {
    res.status(400)
    res.json({ error })
  }
}));

// Updates a course and returns no content
router.put('/api/courses/:id', asyncHandler(async(req, res) => {
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
router.delete('/api/courses/:id', asyncHandler(async(req, res) => {
  try{
    await Course.destroy({
      where: {
        id: req.params.id
      }
    })
    res.status(204)
  } catch(error) {
    res.status(400)
    res.json({ error })
  }
  
}));

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

module.exports = router