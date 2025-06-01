const express = require('express')
const app = express()
const port = 8080
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('main.db');

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

app.get('/login', (req, res) => {
  console.log("login request from " + req.ip + " /login -> GET request")
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

