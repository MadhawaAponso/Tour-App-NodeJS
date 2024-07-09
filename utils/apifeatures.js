class AllAPIFeatures{
    constructor(mongooseQuery,ExpressQuery){
        this.mongooseQuery = mongooseQuery // the query we are sending for mongoose
        this.ExpressQuery = ExpressQuery // the req.query we are getting from the express/ postman

    }

    filter(){
        const queryobj = {...this.ExpressQuery}
        const exludeFields = ['page','limit','sort','fields']
        exludeFields.forEach(element=>delete queryobj[element]); 

        //ADVANCE FILTERING : when in url it contains greater than equal, less than equal , less than and greater than..
        let queryString = JSON.stringify(queryobj)
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g , match=>`$${match}`); 
        


        //BUILDING THE QUERY
        this.mongooseQuery=this.mongooseQuery.find(JSON.parse(queryString))

        return this;

    }
    sort(){
        if(this.ExpressQuery.sort){
            const queryOrder = this.ExpressQuery.sort.split(',').join(" ") // if there are prices with same value then it consider ratingsavgs
            console.log(queryOrder)
            this.mongooseQuery = this.mongooseQuery.sort(queryOrder)
        }else{
            this.mongooseQuery = this.mongooseQuery.sort('name')
        }
        return this;

    }
    limiting(){
        if(this.ExpressQuery.fields){
            const queryFields = this.ExpressQuery.fields.split(',').join(" ")
            this.mongooseQuery = this.mongooseQuery.select(queryFields)
        }else{
            this.mongooseQuery = this.mongooseQuery.select('-__v') // select everthing execpt __V
        }
        return this;
    }
    paginate(){
        const page = this.ExpressQuery.page*1||1
        const limit = this.ExpressQuery.limit*1||100
        const skip = (page-1)*limit

        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit) // if the limit is 3 and page is one: then there are only three things in the one page : if the limit is 3 and page is two then there are 4th 5th and 6 th objects are referring
        return this;
    }

}module.exports = AllAPIFeatures