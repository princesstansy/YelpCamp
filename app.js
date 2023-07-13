//development mode
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
//require('dotenv').config(); //production mode 

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

//const dbUrl = "mongodb+srv://new-user-01:1234@cluster0.zii5jse.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect('mongodb://localhost:27017/yelp-camp');
//mongoose.connect(dbUrl);

// Store the database connection object in a variable called 'db'
const db = mongoose.connection;
// Log an error message if there's an issue connecting to the database
db.on("error", console.error.bind(console, "connection error:"));
// Once the connection is open, log a success message
db.once('open', () => {
   console.log("Database connected");
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
app.use(express.urlencoded({extended: true}));
// Enable method overriding for PUT and DELETE requests
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')))

app.use(mongoSanitize())

const store = new MongoStore({
    url: 'mongodb://localhost:27017/yelp-camp',
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60

});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
})
// Configuration for the session middleware
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret', // Secret used to sign the session ID cookie
    resave: false, // Determines whether the session should be saved back to the session store
    saveUninitialized: true, // Determines whether uninitialized sessions should be saved to the session store
    cookie: {
        httpOnly: true, // Ensures that the cookie is only accessible through HTTP(S) requests
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Sets the expiry date of the cookie (7 days from the current time)
        maxAge: 1000 * 60 * 60 * 24 * 7 // Sets the maximum age of the cookie (7 days in milliseconds)
    }
}


app.use(session(sessionConfig));

app.use(flash()); //flash middleware
app.use(helmet({contentSecurityPolicy: false}));

//--------------------------------------------------------------------------------------
//Passport setup - for authentication 
//--------------------------------------------------------------------------------------

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

app.use((req, res, next) =>{
    if(!['/login', '/'].includes(req.originalUrl)){
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
// -----------------------------------------------------------
// Defining a route for the home page ("/") that sends the response "Home"
app.get('/', (req, res) => {
    res.render('home');
});



//catch-all route handler (handles requests for non-existent routes.)
app.all('*', (req, res, next) => {
   next(new ExpressError('Page Not Found', 404))
})

//Error handling middleware 
app.use((err, req, res, next) =>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error.ejs', {err});

})


//start the server and listen oncoming requests
app.listen(3000, () => {
    console.log('Serving on port 3000');
}) 

