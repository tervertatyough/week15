const express = require("express");
const app = express();
var path = require("path");
var fs = require("fs");

//config Express.js
app.use(express.json());

app.use(function (req, res, next) {
  console.log("In comes a " + req.method + " to " + req.url);
  next();
});

app.use(function (req, res, next) {
  var filePath = path.join(__dirname, "img", req.url);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }

    if (fileInfo.isFile()) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });
});

// app.use(function (req, res, next) {
//   res.status(404);
//   res.send("File not found!");
// });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  next();
});

const MongoClient = require("mongodb").MongoClient;

let db;

MongoClient.connect(
  "mongodb+srv://codecamp:codecamp2021@realmcluster.dlr0q.mongodb.net/",
  (err, client) => {
    db = client.db("Webstore");
  }
);

//Display a message
app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g., /collection/messages");
});

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
  });
});

const ObjectID = require("mongodb").ObjectID;
app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e);
    res.send(result);
  });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
    }
  );
});

app.delete("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.deleteOne(
    {
      _id: ObjectID(req.params.id),
    },
    (e, result) => {
      if (e) return next(e);
      res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
    }
  );
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log("Mongo app listening on port 3001!"));
