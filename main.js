const express = require('express')
const app = express()
const port = 8080
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('main.db');
const crypto = import('node:crypto');


app.use(express.json())

app.get('/', (req, res) => {
  res.send(302);
  console.log("status request from " + req.ip + " / -> GET request");
})

app.get('/inventory', async (req, res) => {
  console.log("inventory DB request from " + req.id + "/inventory -> GET request");
  await db.all("SELECT * FROM inventory", (err, row) =>{
    if (err){
      res.status(400);
      return;
    }
    res.json({
      row,
    })
  });
})

app.get('/login', async (req, res) => {
  console.log("login request from " + req.ip + " /login -> GET request")
  
  let username = await req.body.username;
  let password = await req.body.password;
  let date = new Date();
  let usercheck = false;
  if (username != undefined && password != undefined){
    db.all('SELECT username, password FROM auth', (err, row) =>{
      if(err) {
        res.status(400);
      }
      for(i=0; i <= row.length; i++){
        if(username == row[i].username && password == row[i].password){
          console.log("login")
          usercheck = true;
          res.send(200)
          break;
        }
      }
    })
  }
  else{res.send(400)}
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

