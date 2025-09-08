const express = require('express')
const app = express()
const port = 8080
const sqlite = require('node:sqlite');
const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync('/home/lavapuppydog/repos/NETLAB_API/main.db');
const fs = require('fs');

//calls express 
app.use(express.json())

//log for the request
app.use((req, res, next) => {
  var log = 'Request Info:' + ' Time:' + new Date() + ' Type:' + req.method + ' Ip:' + req.ip;
  
  fs.appendFile('logs.txt','\n' + log, (err) => {
    if (err) throw err;
  }); 
 next()
})




app.get('/', (req, res) => {
  res.send(200);
})

app.post('/login', (req, res) =>{
 let username = req.body.username;
 let password = req.body.password;
 const user_pass = database.prepare("SELECT username, password FROM auth WHERE username='"+ username +"' AND password='"+ password +"';")
 let user_db = user_pass.all()
 if(user_db.length < 0){
  res.send()
 } 
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
