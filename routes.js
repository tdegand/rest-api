const express = require('express');
const router = express.Router();
const { User, Course } = require('./models');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');

router.use(express.json());

//user authentication middleware will go here
const authenticateUser = async (req, res, next) => {
  let message = null;
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);
  // If the user's credentials are available...
    if(credentials) {
      const users = await User.findAll()
      //finds the user and matches the credentials
      const user = users.find(user => user.emailAddress === credentials.name)
      if(user) {
        const authenticated = bcryptjs
          .compareSync(credentials.pass, user.password);
          //if credentials match then set the req object to be the current user
          if(authenticated) {
            console.log(`Authentication successful for username: ${user.emailAddress}`);
            req.currentUser = user;
          } else {
            message = `Authentication failure for username: ${user.emailAddress}`;
          }
      }  else {
        message = `User not found for username: ${credentials.name}`;
      } 
    } else {
      message = 'Auth header not found';
    }
    //if authentication does not work return an error and access denied message
    if(message) {
      console.warn(message)
      res.status(401).json({ message: 'Access Denied' });
    } else {
      next();
    }
}

//Async handler for this application
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
router.get('/api/users', authenticateUser, asyncHandler(async(req, res) => {
  const user = req.currentUser;
  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
  })
}));

// Creates a user, sets the Location header to "/", and returns no content
router.post('/api/users', [
  //checks to make sure required fields are filled in
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a first name'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a last name'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide an email address'),
  //validates that it is in fact an email address
  check('emailAddress')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a "password"'),
], asyncHandler(async(req, res) => {
  const errors = validationResult(req);

  //if there are error then it maps over each one and returns it to the user
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  try{
      let user = req.body;
      user.password = bcryptjs.hashSync(user.password);
      await User.create(user)
      res.location('/').status(200)
  }catch(error) {
      res.status(400)
      res.json({ error });
  }
}));

// Returns a list of courses (including the userId that owns each course)
router.get('/api/courses', asyncHandler(async(req, res) => {
  try {
      const courses = await Course.findAll({
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id','firstName','lastName', 'emailAddress']
          }
        ]
      });
      res.json(courses)
  } catch(error) {
      res.status(404)
      res.json({ error })
  }
}));

// Returns the course (including the user that owns the course) for the provided course ID
router.get('/api/courses/:id', asyncHandler(async(req, res) => {
  try {
     await Course.findByPk(req.params.id).then(course => {
       if(course) {
        res.status(200)
        res.json({ course })
       } else {
         res.status(404).json({
           message: "course does not exist"
         })
       }
      
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
router.post('/api/courses', [
  //checks to make sure required fields are filled in
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a Title'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a description'),
], authenticateUser, asyncHandler(async(req, res) => {
  const errors = validationResult(req);

  //if there are error then it maps over each one and returns it to the user
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  try {
      res.status(201)
      const course = await Course.create(req.body)
      res.location("/api/courses" + course.id);
  }catch(error) {
      res.status(400)
      res.json({ error: error.errors })
  }
}));

// Updates a course and returns no content
router.put('/api/courses/:id',  [
  //checks to make sure required fields are filled in
  check('title')
    .exists()
    .withMessage('Please provide a Title'),
  check('description')
    .exists()
    .withMessage('Please provide a description'),
], authenticateUser, asyncHandler(async(req, res) => {
  const errors = validationResult(req);

  //if there are error then it maps over each one and returns it to the user
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  try{
    const curCourse = await Course.findByPk(req.params.id)
    if(curCourse){
      res.status(204) 
      curCourse.update(req.body)
    } else {
      res.status(404).json({
        message: "Course could not be found"
      })
    } 
  }catch(error) {
    res.status(400)
    res.json({ error })
  }
}));

// deletes a course and returns no content
router.delete('/api/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
  try{
      await Course.destroy({
      where: {
          id: req.params.id
      }
      })
      res.status(204)
      res.json({
        message: "Course deleted!"
      })
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