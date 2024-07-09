const mongoose = require('mongoose');
const slugify = require('slugify');

//model is the best place for validation
// Define the schema for a tour
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], // Name is required
        unique: true, // Name must be unique
        trim: true, // Remove any whitespace from the beginning and end
        maxlength : [40 , "A tour must have less than or equal to 40 characters"],
        minlength : [4 , "A tour must have more than 4 characters"],
    },
    slug: String, // URL-friendly version of the name
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'], // Duration is required
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'], // Maximum group size is required
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'], // Difficulty level is required
        enum: {
            values: ['easy', 'medium', 'difficult'], // Valid difficulty levels
            message: 'Difficulty is either: easy, medium, difficult', // Custom error message for invalid values
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5, // Default rating if none is provided
        min: [1, 'Rating must be above 1.0'], // Minimum rating value
        max: [5, 'Rating must be below 5.0'], // Maximum rating value
    },
    ratingsQuantity: {
        type: Number,
        default: 0, // Default quantity of ratings
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'], // Price is required
    },
    priceDiscount: {
        type: Number,
        // custom validate function : only creating new doc. not working for update
        validate: {
          validator : function(val){
            return val<this.price  // val means priceDiscount. if price discount should be lower than price
        },message : 'Discount price ({VALUE}) should be below regular price'
        },
    },
    summary: {
        type: String,
        trim: true, // Remove any whitespace from the beginning and end
        required: [true, 'A tour must have a description'], // Summary is required
    },
    description: {
        type: String,
        trim: true, // Remove any whitespace from the beginning and end
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image'], // Cover image is required
    },
    images: [String], // Array of image URLs
    createdAt: {
        type: Date,
        default: Date.now(), // Default to the current date and time
        select: false, // Do not include this field in queries by default
    },
    startDates: [Date], // Array of start dates
    secretTour: {
        type: Boolean,
        default: false, // Default to not a secret tour
    }
    ,

    // These are embedded docs : To add the related data directly
    //Embedded documents in MongoDB are sub-documents that are stored within a parent document, creating a nested structure. 
    //This approach allows for the inclusion of related data directly within a single document, rather than referencing it from a separate collection. 
    //Let's explain embedded documents in more detail and how they differ from other forms of document relationships.
    //Embedded documents are nested objects within a main document. For example, in the provided schema:

    //start locations in a single embedded doc 
    startLocation:{
        type:{
            type : String,
            default : 'Point',
            enum : ["Point"]

        },
        coordinates : [Number],
        address : String,
        description : String
    },

    // location is a array of embedded docs
    locations : [
        {
            type:{
            type : String,
            default : 'Point',
            enum : ["Point"]

        },
        coordinates : [Number],
        address : String,
        description : String,
        days: Number

        }
    ],
    guides : [
        {
            type : mongoose.Schema.ObjectId, // guides are in the user doc.we are refering here using there ids. so it should be mongoose.Schema.object.id
            ref : "User" // referning to another model
        }
    ]

},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


// Virtual : for this we need that toJSON and stuff
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
  });

tourSchema.virtual('reviews', {
    ref: 'Review', // Specifies the model to use for population. Here, it refers to the Review model.
    foreignField: 'tour', // Indicates which field in the Review model is used to establish the relationship. The 'tour' field in the Review model contains the _id of the Tour document it references.
    localField: '_id' // Specifies the local field in the Tour model that corresponds to the foreignField in the Review model. Here, the _id of the Tour model is used to match against the 'tour' field in the Review model.
  });

// DOCUMENT MIDDLEWARE: Runs before saving or creating a document
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true }); // Create a slug from the tour name
    next();
});

// QUERY MIDDLEWARE: Runs before executing find queries (e.g., find, findById, findOne)

//1) Query middleware : excludes all the data with secret key is true
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } }); // Exclude secret tours from results
    next();
});


//2) Query middleware : refering to guide parameters if there is a query starts with find
//here we are populating guides with actucal data in user
tourSchema.pre(/^find/,function(next){
    this.populate({
        path: 'guides',
        select: '-__v' // Exclude the __v field
  });
  next()
})




// AGGREGATION MIDDLEWARE: Runs before executing aggregate queries
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // Exclude secret tours from aggregation results
    next();
});

// Create the model from the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour; // Export the model for use in other parts of the application
