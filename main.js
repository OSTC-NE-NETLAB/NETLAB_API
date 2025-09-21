const express = require('express')
const jwt = require('json-web-token')
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

//sets up expresses static dir
const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: "css",
  index: false,
  maxAge: '2h',
  redirect: false,
  setHeaders (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}






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

//login functions
app.route('/login')
  .post(async (req, res) =>{

    let username = req.body.username;
    let password = req.body.password;
    if(username != undefined  && password != undefined){

      const user_pass = database.prepare("SELECT username, password FROM auth WHERE username='"+ username +"' AND password='"+ password +"';")
      let user_db = user_pass.all()
      if(user_db.length == 0){
        res.send(402)
      } else{
        var NewSession = await genkey();
        await database.exec("UPDATE auth SET Session = '" + NewSession + "' WHERE username='" + username + "' AND password='" + password + "';")
        let getinfo = database.prepare("SELECT userid, username, Session FROM auth WHERE Session='"+ NewSession +"';");
        let sessioninfo = getinfo.all()
        let token = await genkey(sessioninfo[0].username, sessioninfo[0].userid, sessioninfo[0].Sessions)
        res.status(202).json({message: 'login successful', token: token});
      }
    }else{
      res.send(402);
    } 
 
    })
  .get((req, res) =>{
    try{
      res.sendFile(process.cwd() + '/html/login.html')
    }catch(err){
      res.send(500)
      let log = 'Request info:' + ' Time: ' + new Date() + ' Type: ' + req.method + ' Ip:' + req.ip;
      fs.appendFile('logs.txt', '\n' + log + ' Error Thrown: ' +  err, (error)=>{
        if (error) throw error;}
        
      )}
  })

//session key generator
async function genkey (){
 return Math.random().toString(36).substring(2);
  
}

//json web token maker
async function getLoginToken(user, userid, session){
  let payload = {
    username: user,
    password: userid,
    timestamp: new Date()

  }
  let secret = session;

  let token = await jwt.encode(secret, payload, function (err, token) {
  if (err) {
    console.error(err.name, err.message);
  } else {
    return token;
  }})
  return token;
}

// keep at the bottom to ensure it gets checked last
app.use(express.static(process.cwd() + '/public', options))

app.listen(port, () => {
  console.log(`Currently Listening on ${port}`)
})
