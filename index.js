const dotenv = require('dotenv').config()
const express = require('express');
const app = express()
const mongodb = require("mongodb")
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
        const carCollection=client.db("inventory").collection("cars")
        app.get("/inventory",async(req,res)=>{
            const limit= parseInt( req.query.size)
const query={}
const cursor=carCollection.find(query).limit(limit)
const result=await cursor.toArray()
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

