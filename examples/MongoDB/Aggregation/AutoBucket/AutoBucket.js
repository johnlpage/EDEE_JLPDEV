var mongoClient = null;
var listingsCollection

// Find out what Cheap, Medium and Expensive AirBNB means

async function get_Cohorts(req, res) {
   
    // Calcualte the total price for nights
    var priceFor3Days = { $add : [ "$cleaning_fee", { $multiply: [ "$price", 3] }]}
 
    var cohortDefinition = {}
    cohortDefinition.groupBy = priceFor3Days
    cohortDefinition.buckets = 3
    var output={}
    output.totalProperties = { $count :{} }
    output.averageBeds = { $avg : "$beds" }
   
    hasPool = {$in: ["Pool","$amenities"]}
    output.totalWithPool = { $sum : { $cond : { if:hasPool, then: 1,  else: 0 }}}
    
    cohortDefinition.output = output
    bucketAutoStage = { $bucketAuto: cohortDefinition}
    
    percentWithPool = {$set: { pcWithPool : {$multiply:[{ $divide : [ "$totalWithPool","$totalProperties"]},100]}}}
    
    var pipeline = [bucketAutoStage,percentWithPool]
    
    var cursor =  listingsCollection.aggregate(pipeline)

    var results = await cursor.toArray();

    res.status(200)
    res.send(results)
}

async function initWebService() {
    var userName = system.getenv("MONGO_USERNAME")
    var passWord = system.getenv("MONGO_PASSWORD")
    mongoClient = new MongoClient("mongodb+srv://" + userName  + ":" + passWord + "@learn.mongodb.net");
    listingsCollection = mongoClient
            .getDatabase("sample_airbnb")
            .getCollection("listingsAndReviews")
  }
    