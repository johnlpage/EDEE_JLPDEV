var mongoClient = null;
var sales;

properties = {};
properties._id = { bsonType: "objectId" };
properties.quantity = { bsonType: "int", minimum: 1 };
properties.price = { bsonType: "double" };
properties.total = { bsonType: "double" };
properties.date = { bsonType: "date" };
jsonSchema = {
  bsonType: "object",
  required: ["_id", "quantity", "price", "date", "total"],
  properties: properties,
};

// This is the ANSWER part

calcTotal = { $multiply: ["$price", "$quantity"] };
checkTotal = { $eq: ["$total", calcTotal] };
validatorSpec = { $jsonSchema: jsonSchema, $expr: checkTotal };


//Post the data -  If it doesn't match the description it will fail.
async function post_Data(req, res) {
  doc = JSON.parse(req.body);

  //Comment out line below to see type enforced
  if (doc.date) {
    doc.date = new Date(doc.date);
  } // Explicity cast to Date type

  rval = await sales.insertOne(doc);
  res.status(201);
  res.send(rval);
}

async function get_Data(req, res) {
  data = await sales.find({}).toArray();
  res.status(201);
  res.send(data);
}
async function initWebService() {
  var userName = await system.getenv("MONGO_USERNAME");
  var passWord = await system.getenv("MONGO_PASSWORD", true);
  mongoClient = new MongoClient(
    "mongodb+srv://" + userName + ":" + passWord + "@learn.mongodb.net",
  );

  db = mongoClient.getDatabase("examples");
  sales = db.getCollection("sales");
  await sales.drop();
  rval = await db.createCollection("sales", { validator: validatorSpec });
}
