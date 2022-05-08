const dotenv = require('dotenv').config()
const express = require('express');
const app = express()
const mongodb = require("mongodb")
const ObjectId = require("mongodb").ObjectId
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors")
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())

 // verify token 
 const verifyJwt=async(req,res,next)=>{
    const header=req.headers.authorization
    if (!header) {
        return res.status(401).send({message:"Unauthorized access "})
    }

   const token=header.split(" ")[1]
   jwt.verify(token,process.env.PRIVATE_KEY,(error,decoded)=>{
       if(error){
           return res.status(403).send({message:"Forbidden"})
       }
       if (decoded) {
           req.decoded=decoded
       }
       next()
   })
}

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
        app.get("/userscar",verifyJwt, async (req, res) => {
           const decoded=req.decoded.email
            const email = req.query.email
        if (email===decoded) {
            const query={email:email}
            const cursor=  usersCarCollection.find(query)
            const result=await cursor.toArray()
            res.send(result)
        }
            else{
                res.status(403).send({message:"Forbidden"})
            }
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

        //  Authorization  with jwt   
        app.post("/login",(req,res)=>{
            const email=req.body.email
            const token=jwt.sign({email},process.env.PRIVATE_KEY,{ expiresIn:"2d" })
            res.send(token)
        })
       

    }
    finally {

    }
}
run()

app.listen(port, () => {
    console.log("i am also well");
})

