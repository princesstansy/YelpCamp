// Development mode
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
  }
  
  // Require necessary packages and modules
  //-----------------------------------------------------------
  
  const mongoose = require('mongoose'); // Mongoose library for MongoDB interactions
  
  const express = require('express'); // Express.js framework
  const path = require('path'); // Path module for working with file and directory path
  const ejsMate = require('ejs-mate'); // ejs-mate package for using EJS templates
  const session = require('express-session');
  const flash = require('connect-flash');
  const methodOverride = require('method-override'); // method-override package for HTTP method overriding
  
  const Joi = require('joi'); // Joi library for data validation
  
  const ExpressError = require('./utils/ExpressError');
  
  const passport = require('passport');
  const LocalStrategy = require('passport-local');
  const User = require('./models/user');
  
  const campgroundRoutes = require('./routes/campgrounds');
  const reviewRoutes = require('./routes/reviews');
  const userRoutes = require('./routes/users');
  const mongoSanitize = require('express-mongo-sanitize');
  const helmet = require('helmet');
  const MongoStore = require('connect-mongo')(session);
  
  //------------------------------------------------------------
  
  // Connect to the MongoDB database at the specified URL 
  //-------------------------------------------------------------
  
  const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
  
  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).then(() => {
    console.log("Database connected");
  }).catch((err) => {
    console.error("Connection error:", err);
  });
  
  //-------------------------------------------------------------
  
  // Creating and setting up a new Express app
  //-------------------------------------------------------------
  const app = express();
  // Setting up the EJS templating engine
  app.engine('ejs', ejsMate);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  
  // Parse request bodies as URL-encoded data
  app.use(express.urlencoded({ extended: true }));
  // Enable method overriding for PUT and DELETE requests
  app.use(methodOverride('_method'));
  
  app.use(express.static(path.join(__dirname, 'public')))
  
  app.use(mongoSanitize());
  
  // Configuration for the session middleware
  const sessionConfig = {
    store: new MongoStore({
      mongoUrl: dbUrl,
      touchAfter: 24 * 60 * 60,
      crypto: {
        secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
      }
    }),
    name: 'session',
    secret: process.env.SECRET || 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }
  
  app.use(session(sessionConfig));
  
  app.use(flash());
  app.use(helmet({ contentSecurityPolicy: false }));
  
  //--------------------------------------------------------------------------------------
  // Passport setup - for authentication 
  //--------------------------------------------------------------------------------------
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
      req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
  })
  
  //--------------------------------------------------------------------------------------
  
  // Define routes and handle requests
  
  app.use('/', userRoutes);
  app.use('/campgrounds', campgroundRoutes);
  app.use('/campgrounds/:id/reviews', reviewRoutes);
  
  // Defining a route for the home page ("/") that sends the response "Home"
  app.get('/', (req, res) => {
    res.render('home');
  });
  
  //catch-all route handler (handles requests for non-existent routes.)
  app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
  })
  
  //Error handling middleware 
  app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error.ejs', { err });
  })
  
  //start the server and listen oncoming requests
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Serving on port ${port}`);
  })
  