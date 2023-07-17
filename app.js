// Require necessary packages and modules
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const Joi = require('joi');
const helmet = require('helmet');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// Development mode configuration
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Connect to the MongoDB database at the specified URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const store = new MongoStore({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, // You can adjust this value according to your needs
  crypto: {
    secret: process.env.MONGO_STORE_SECRET || 'thisshouldbeabettersecret!',
  },
});

// Creating and setting up a new Express app
const app = express();

// Setting up the EJS templating engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse request bodies as URL-encoded data
app.use(express.urlencoded({ extended: true }));
// Enable method overriding for PUT and DELETE requests
app.use(methodOverride('_method'));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable session and flash messages
const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// Initialize Passport middleware
app.use(passport.initialize());
// Configure Passport to use session-based authentication
app.use(passport.session());
// Set up a LocalStrategy for authenticating users based on username and password
passport.use(new LocalStrategy(User.authenticate()));
// Configure how user objects are serialized for storage in the session
passport.serializeUser(User.serializeUser());
// Configure how user objects are deserialized from the session
passport.deserializeUser(User.deserializeUser());

// Middleware to set local variables for use in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Use helmet middleware for security headers
app.use(helmet({ contentSecurityPolicy: false }));
// Sanitize user input to prevent NoSQL injection
app.use(mongoSanitize());

// Define routes and handle requests
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Define a route for the home page ("/") that sends the response "Home"
app.get('/', (req, res) => {
  res.render('home');
});

// Catch-all route handler (handles requests for non-existent routes)
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error.ejs', { err });
});

// Start the server and listen for incoming requests
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
