const express = require("express");
const app = express();
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
require('dotenv').config();

const PORT = process.env.PORT;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


const client = new MongoClient(process.env.MONGO_URL);

//GET all users
app.get("/getUsers", async (req, res) => {
    await client.connect(URL);
    console.log('Connected successfully to server');

    const db = client.db("college-db");
    const data = await db.collection('users').find({}).toArray();
    
    client.close();
    res.send(data);
});

//POST new user
app.post("/addUser", async (req, res) => {
    const userObj = req.body;
    console.log(req.body);
    await client.connect(URL);
    console.log('Connected successfully to server');

    const db = client.db("college-db");
    const data = await db.collection('users').insertOne(userObj);
    console.log(data);
    console.log("data inserted in DB");
    client.close();

    res.send("data inserted in DB");
});


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});