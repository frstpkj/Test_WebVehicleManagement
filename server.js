require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGODB;

class Vehicle {
  constructor(data) {
    this.data = data;
  }
  get licensePlate() {
    return this.data.LicensePlate;
  }
  get vehicleBrand() {
    return this.data.VehicleBrand;
  }
  get vehicleModel() {
    return this.data.VehicleModel;
  }
  get note() {
    return this.data.Note;
  }
  get etc() {
    return this.data.etc;
  }
}

app.use(express.json());

const middleware = (req, res, next) => {
  // MD5[H@upc@r!] => 39b4e619f3e308c8e88edf7b07fd6c09
  if (req.headers.authorization === "39b4e619f3e308c8e88edf7b07fd6c09") next();
  else {
    res.status(401);
    res.send("UNAUTHORIZED");
  }
};

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", middleware, (req, res) => {
  client
    .db("haupcar")
    .collection("vehicle")
    .find({})
    .toArray()
    .then((result) => {
      console.log(result);
      res.status(200);
      res.json({ message: result });
    });
});

app.get("/:id", middleware, (req, res) => {
  const { id } = req.params;
  client
    .db("haupcar")
    .collection("vehicle")
    .findOne({ LicensePlate: id })
    .then((result) => {
      if (result != null) {
        res.status(200);
        res.json({ message: result });
      } else {
        res.status(404);
        res.json({ message: "Not_Found" });
      }
    });
});

app.post("/vehicle", middleware, (req, res) => {
  var payload = req.body;
  var vehicle = new Vehicle(payload);

  client
    .db("haupcar")
    .collection("vehicle")
    .findOne({ LicensePlate: vehicle.licensePlate })
    .then((result) => {
      try {
        if (result._id != null) {
          res.status(409);
          res.json({ message: "This license plate already exits" });
        }
      } catch (err) {
        var myobj = {
          LicensePlate: vehicle.licensePlate,
          VehicleBrand: vehicle.vehicleBrand,
          VehicleModel: vehicle.vehicleModel,
          Note: vehicle.note,
          etc: vehicle.etc,
        };
        client
          .db("haupcar")
          .collection("vehicle")
          .insertOne(myobj)
          .then((res) => {
            console.log(res);
          })
          .then(() => {
            res.status(200);
            res.json({ message: "success" });
          });
      }
    });
});

app.put("/vehicle/:id", middleware, (req, res) => {
  const { id } = req.params;
  var newvalues = { $set: req.body };
  client
    .db("haupcar")
    .collection("vehicle")
    .updateOne({ LicensePlate: id }, newvalues)
    .then((result) => {
      if (result.matchedCount == 1) {
        res.status(200);
        res.json({ message: "Success", data: newvalues });
      } else {
        res.status(404);
        res.json({ message: "Not_Found" });
      }
    });
});

app.delete("/vehicle/:id", middleware, (req, res) => {
  const { id } = req.params;
  client
    .db("haupcar")
    .collection("vehicle")
    .deleteOne({ LicensePlate: id })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200);
        res.json({ message: "Success", data: result });
      } else {
        res.status(404);
        res.json({ message: "Not_Found" });
      }
    });
});

app.listen(port, () => {
  console.log("Starting node.js at port " + port);
});
