const dotenv = require('dotenv').config()
const express = require('express');
const app = express()
const mongodb = require("mongodb")
const ObjectId = require("mongodb").ObjectId
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors")
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("i am running well")
})

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.b4wi5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const carCollection = client.db("inventory").collection("cars")
        const usersCarCollection = client.db("usersCar").collection("cars")
        app.get("/inventory", async (req, res) => {
            const limit = parseInt(req.query.size)
            const query = {}
            const cursor = carCollection.find(query).limit(limit)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get("/inventory/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await carCollection.findOne(query)
            res.send(result)
        })
        app.put("/update/:id", async (req, res) => {
            const newQuantity = req.body.newQuantity
            const id = req.params.id
            // console.log(newQuantity,id);
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    quantity: newQuantity
                }
            }
            const result = await carCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        app.post("/addcar", async (req, res) => {
            const car = req.body.cardata
            const result = await usersCarCollection.insertOne(car)
            res.send(result)
        })
        app.get("/userscar", async (req, res) => {
            const email = req.query.email
            const query={email:email}
            const cursor=  usersCarCollection.find(query)
            const result=await cursor.toArray()
            res.send(result)
        })
        app.delete("/userscar/:id", async (req, res) => {
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await usersCarCollection.deleteOne(query)
            res.send(result)
        })
        app.delete("/deletecar/:id",async (req, res) => {
            const id = req.params.id
            const query={_id:ObjectId(id)}
            const result= await carCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally {

    }
}
run()

app.listen(port, () => {
    console.log("i am also well");
})

