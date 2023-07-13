
// Import required modules and files
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once('open', () => {
   console.log("Database connected");
});

//Pick a random index in array = array[Math.floor(Math.random()*array.length)]

const sample = array => array[Math.floor(Math.random()*array.length)];


// Function to seed the database with campground data
const seedDB = async () => {
    await Campground.deleteMany({}); // Delete all existing campgrounds from the database

    // Generate 50 new campground records
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        
        // Creating a new campground object
        const camp = new Campground({
            author: '64a29cf80988cc38e51f951e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
              ]
          },
            images: [
                {
                  url: 'https://res.cloudinary.com/dzt98ub9a/image/upload/v1689049155/YELPCAMP/n5gtmxe6y40nkr7sclb1.jpg',
                  filename: 'YELPCAMP/n5gtmxe6y40nkr7sclb1',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dzt98ub9a/image/upload/v1689049158/YELPCAMP/hnbpzpk3gz8n46va7ipu.jpg',
                  filename: 'YELPCAMP/hnbpzpk3gz8n46va7ipu',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dzt98ub9a/image/upload/v1689049161/YELPCAMP/bonarpbaf4jqhsumgigk.jpg',
                  filename: 'YELPCAMP/bonarpbaf4jqhsumgigk',
                
                }
              ],
             
            })
        await camp.save(); // Saving the campground to the database
    }
}
// Call the seedDB function to seed the database and then close the connection
seedDB().then(() => {
    mongoose.connection.close();
})


