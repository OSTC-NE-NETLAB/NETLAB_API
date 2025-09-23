const express = require('express')
const app = express()
const toml = require('toml');
const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync(process.cwd()+'/main.db');
const fs = require('fs');
const path = require('path');
const config = toml.parse(fs.readFileSync('./server-config.toml', 'utf-8'));
const port = config.server_interface.port;
const crypto = require('crypto');


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
  maxAge: '0',
  redirect: false,
  setHeaders (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}


app.use(express.static(path.join(__dirname, "public")))



//log for the request
app.use((req, res, next) => {
  var log = 'Request Info:' + ' Time:' + new Date() + ' Type:' + req.method + ' Ip:' + req.ip;
  
  fs.appendFile('logs.txt','\n' + log, (err) => {
    if (err) throw err;
  }); 
  
 next()
})



//login functions
app.route('/login')
  .post(async (req, res) =>{

    let username = req.body.username;
    let password = req.body.password;
    if(username != undefined  && password != undefined){

      let user_pass = database.prepare("SELECT username, password, userid FROM auth WHERE username= ? AND password= ?;")
      let user_db = user_pass.all(username, password)
      var Session = await genSession(user_db[0].username, user_db[0].userid);
      if(user_db.length == 0){
        res.send(402)
      } else{
        let update = database.prepare("UPDATE auth SET Session = ? WHERE username= ? AND password= ?")
        update.run(Session.Session, user_db[0].username, user_db[0].password)
        let getinfo = await database.prepare("SELECT userid, username, Session FROM auth WHERE Session= ?;");
        let sessioninfo = getinfo.all(Session.Session)
        
        res.status(202).json({message: 'login successful', session: Session, username : sessioninfo[0].username, userid : sessioninfo[0].userid});
      }
    }else{
      res.send(402);
    } 
 
    })
  .get((req, res) =>{
    try{
      res.sendFile(path.join(__dirname, '/html/login.html'))
    }catch(err){
      res.send(500)
      let log = 'Request info:' + ' Time: ' + new Date() + ' Type: ' + req.method + ' Ip:' + req.ip;
      fs.appendFile('logs.txt', '\n' + log + ' Error Thrown: ' +  err, (error)=>{
        if (error) throw error;}
        
      )}
  })

//homepage
app.route('/')
  .get(async (req, res)=>{
    res.send("wow it worked!")
  })
  .post(async (req, res) =>{

  })

//session key generator
async function genSession (username, userid){
  let PrivateKey = await fs.readFileSync(config.server_certificates.PrivateKey, "utf-8");
  let PublicKey = await fs.readFileSync(config.server_certificates.PublicKey, "utf-8");
  let data = {
    username : username,
    userid : userid,
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    init: Math.floor(Date.now()),
  }
  let payload = JSON.stringify(data)
  let Session = crypto.publicEncrypt(
  {
    key: PublicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },

  Buffer.from(payload));
  let SessionSig =  crypto.sign("sha256", Buffer.from(Session), {
  key: PrivateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  });
  let Verfied = {
    sig : SessionSig.toString('base64'),
    Session: Session.toString('base64'),
  }
  return Verfied;
}





app.listen(port, () => {
  console.log(`Currently Listening on ${port}`)
})
