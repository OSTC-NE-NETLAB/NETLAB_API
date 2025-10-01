// imported packages
const express = require('express');
const app = express()
const toml = require('toml');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

//imported variables -- ONLY CHANGE IF YOU KNOW WHAT YOUR DOING!!!
const database = new DatabaseSync(process.cwd()+'/main.db');
const config = toml.parse(fs.readFileSync('./server-config.toml', 'utf-8'));
const port = config.server_interface.port;



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



//Starts Express -- DO NOT MOVE 
app.use(express.json())
app.use(cookieParser())
app.use(express.static(__dirname + '/public'))

/**##################################################################################################################
 * 
 * FUNCTIONS
 * 
 * ##################################################################################################################
 */

async function AuthenticateUser(username, password) {
  database.prepare("SELECT userid, username, password, FROM auth WHERE username=")
}




/**###################################################################################################################
 * 
 * ROUTES && MIDDLEWARE
 * 
 * ####################################################################################################################
 */

app.route('/login')
    .get((req, res) => {
      res.status(200).sendFile(path.join(__dirname + '/html/login.html'))
    })


app.route('/signup')
    .get((req, res) => {
      res.status(200).sendFile(path.join(__dirname + '/html/signup.html'))
    })


// middleware for signin
app.use((req, res, next) =>{
  let auth  = req.cookies.autherization;
  if(auth){
    res.send(200)
  }else{
    res.status(401).redirect('/login')
  }
})


app.route('/')
  .get((req, res)=> {
    console.log('hello world')
  })


app.listen(port, () =>{
  console.log(`NETLAB API IS LISTEN ON ${port}`)
})