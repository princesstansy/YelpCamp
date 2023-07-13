const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer  = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const Campground = require('../models/campground');


router.route('/')
// GET route for campground index page
.get(catchAsync(campgrounds.index))  //GET route for making new campground
.post( isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); //POST request to create new campground using the data in the request body.
 


 router.get('/new', isLoggedIn, campgrounds.renderNewForm)
 
 

router.route('/:id')
 .get(catchAsync(campgrounds.showCampground)) //retrieves the campground from the database based on the provided id parameter in the URL and renders a view template to display the details of the campground to the client.
 .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) //PUT request to '/campground/:id' with the updated campground data in the request body. The code finds the campground based on the provided id, updates its properties with the data from req.body.campground, and then redirects the client to the page displaying the updated campground.
 .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) // Handle DELETE request to delete a campground by ID
 
 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
 
 //GET request to display the edit form for a specific campground. It retrieves the campground from the database based on the provided id parameter in the URL and renders a view template to display the edit form with the pre-existing campground data filled in.
 
 module.exports = router;