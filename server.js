
const express = require('express');
const app = express();
const http = require('http');
const jwt = require('jsonwebtoken');

app.use(express.json());

const server = http.createServer(app);

const { socketServer } = require("./socketServer");

require("dotenv").config();
const Port = process.env.PORT;




const generateToken = (id, role, email) => {
  console.log(id, role, email);

  id = id.toString();

  role = role.toString();

  

  return token;
};

app.use("/login", (req, res) => {

    try{
        const username= req.body.Username;
        console.log(username)
        // const token ={
        //     user:"abc",
        //     Name:"TestUser"
        // }
        const token = jwt.sign({username: username }, process.env.JwtEncryptionKey );
        res.status(200).send({message:"Login successful" , token})

    }catch(err){

        console.log(err);
        res.status(401).send({message: "Invalid Credentials"})
    }

});
//initialize app
// add your middlewares and routing

// Socket Server
socketServer(server);

server.listen(Port, () => {
    console.log(`Server is listening on ${Port}`);
});