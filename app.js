

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Require necessary packages and modules
const express = require('express'); // Express.js framework
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Correct usage of the MongoStore constructor

// Other required packages and modules...
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


// Connect to the MongoDB database at the specified URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

// Create an instance of MongoStore using the session object
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, // You can adjust this value according to your needs
  crypto: {
    secret: process.env.MONGO_STORE_SECRET || 'thisshouldbeabettersecret!', // You should use a strong secret here or store it in an environment variable
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

// Sanitize user input to prevent NoSQL injection
app.use(mongoSanitize());

// Configuration for the session middleware
const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret', // Secret used to sign the session ID cookie, you can store it in an environment variable
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

// Flash messages middleware
app.use(flash());

// Helmet middleware for setting security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Passport middleware setup - for authentication
app.use(passport.initialize());
app.use(passport.session());

// Set up a LocalStrategy for authenticating users based on username and password
passport.use(new LocalStrategy(User.authenticate()));

// Configure how user objects are serialized for storage in the session
passport.serializeUser(User.serializeUser());

// Configure how user objects are deserialized from the session
passport.deserializeUser(User.deserializeUser());

// Middleware for storing the returnTo URL for redirecting after login
app.use((req, res, next) => {
  if (!['/login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Define routes and handle requests
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Route for the home page ("/")
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

