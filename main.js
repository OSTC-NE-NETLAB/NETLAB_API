const express = require('express')
const app = express()
const toml = require('toml');
const sqlite = require('node:sqlite');
const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync(process.cwd()+'/main.db');
const fs = require('fs');
const config = toml.parse(fs.readFileSync('./server-config.toml', 'utf-8'));
const port = config.server_interface.port;
//special vars
var return_code;
var return_body;
var retuen_headers;

//text on start 
console.log(

"███╗░░██╗███████╗████████╗██╗░░░░░░█████╗░██████╗░  ░█████╗░██████╗░██╗\n"+
"████╗░██║██╔════╝╚══██╔══╝██║░░░░░██╔══██╗██╔══██╗  ██╔══██╗██╔══██╗██║\n"+
"██╔██╗██║█████╗░░░░░██║░░░██║░░░░░███████║██████╦╝  ███████║██████╔╝██║\n"+
"██║╚████║██╔══╝░░░░░██║░░░██║░░░░░██╔══██║██╔══██╗  ██╔══██║██╔═══╝░██║\n"+
"██║░╚███║███████╗░░░██║░░░███████╗██║░░██║██████╦╝  ██║░░██║██║░░░░░██║\n"+
"╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚══════╝╚═╝░░╚═╝╚═════╝░  ╚═╝░░╚═╝╚═╝░░░░░╚═╝\n"+
"║█████████████████████████████████████████████████████████████████████╗\n"+
"║ ╚═══════════════════════════════════════════════════════════════════╝\n"+
"║                         BY: SAMUEL MASKER                           ║\n"+
"║                FOR INTERNAL USE ONLY WITH THE NE-OSTC               ║\n"+
"║                       LAST UPDATE:  9/08/25                         ║\n"+
"║                      LICENSED UNDER GPL 2.0+                        ║\n"+
"╚═════════════════════════════════════════════════════════════════════╝\n"
)



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

//main login function
app.post('/login', async (req, res) =>{

  let username = req.body.username;
  let password = req.body.password;
  if(username == undefined  || password == undefined){
    password = "null"
    username = "null"
  }
 const user_pass = database.prepare("SELECT username, password FROM auth WHERE username='"+ username +"' AND password='"+ password +"';")
 let user_db = user_pass.all()
 if(user_db.length == 0){
  return_code = 406;
 } else{
  return_code = 202;
 }
 res.send(return_code);
})

//cryptography keys


app.listen(port, () => {
  console.log(`Currently Listening on ${port}`)
})
