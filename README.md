# YelpCamp
YelpCamp is a web application for sharing and reviewing campgrounds. Users can sign up, create campgrounds, leave reviews, and interact with other campers in the community. The application is built using Node.js, Express.js, MongoDB, and various frontend technologies.

## Features

- User authentication: Users can sign up, log in, and log out.
- Campground management: Users can create, edit, and delete campgrounds.
- Review system: Users can leave reviews for campgrounds and delete their own reviews.
- Authorization and ownership: Users can only edit or delete campgrounds and reviews they own.
- Flash messages: Informative messages are displayed to users for success and error notifications.
- Map integration: Campgrounds are displayed on an interactive map using the Mapbox API.
- Image uploads: Campground images can be uploaded and stored using the Cloudinary API.
- Data sanitization: Input data is sanitized to prevent security vulnerabilities.
- Error handling: Custom error handling with detailed error messages.
- Responsive design: The application is designed to be responsive and work well on different screen sizes.

## Installation

1. Clone the repository:

   ```bash 
   git clone https://github.com/your-username/yelp-camp.git
   ```      

3. Install dependencies

   ```bash 
   cd yelp-camp
   npm install
   ```     


5. Set up environment variables:
   * Create a .env file in the root directory.
   * Define the required environment variables in the .env file, such as the MongoDB connection URL, session secret, and any API keys.

6. Run the application:

   ```bash 
    npm start
    ```     
   The application will start running on http://localhost:3000.


## Frontend Technologies

HTML
CSS
JavaScript
EJS (Embedded JavaScript)
Mapbox API
Cloudinary API

## Backend Technologies

Node.js
Express.js
MongoDB
Mongoose

## Other Dependencies

Passport.js
Connect-Mongo
Express-Session
Express-Flash
Helmet
Express-Mongo-Sanitize
Method-Override

## Deployment 

Check out the deployed version here: [https://yelpcamp-3b6h.onrender.com](https://yelpcamp-3b6h.onrender.com)
