// imported packages
const express = require('express');
const app = express()
const toml = require('toml');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

//imported variables -- ONLY CHANGE IF YOU KNOW WHAT YOUR DOING!!!
const database = new DatabaseSync(process.cwd()+'/main.db');
const config = toml.parse(fs.readFileSync('./server-config.toml', 'utf-8'));
const port = config.server_interface.port;


//Keys for encryption -- CHANGE IN CONFIG.TOML
const PrivateKey =  fs.readFileSync(config.server_certificates.PrivateKey, "utf-8");
const PublicKey =  fs.readFileSync(config.server_certificates.PublicKey, "utf-8");

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

//sets up expresses static dir -- !UNUSED VAR! -- DO NOT REMOVE
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

//Allows access to the ./public folder -- DO NOT MOVE
app.use(express.static(path.join(__dirname, "public")))



//log for the request -- !may change!
app.use((req, res, next) => {
  var log = 'Request Info:' + ' Time:' + new Date() + ' Type:' + req.method + ' Ip:' + req.ip;
  
  fs.appendFile('logs.txt','\n' + log, (err) => {
    if (err) throw err;
  }); 
  
 next()
})



//login route -- DO NOT MOVE BELOW THE AUTH MIDDLEWARE
app.route('/')
  .post(async (req, res) =>{

    let username = await Buffer.from(req.body.username).toString('base64');
    let password = req.body.password
    if(username && password){

      let user_pass = database.prepare("SELECT username, password, userid FROM auth WHERE username= ?")
      let user_db = user_pass.all(username)
      let autherizedPass = await bcrypt.compare(password, user_db[0].password)
      if(user_db.length > 0 && autherizedPass){
        var Session = await genSession(user_db[0].username, user_db[0].userid);
        let update = database.prepare("UPDATE auth SET Session = ? WHERE username= ? AND password= ?")
        update.run(Session.Session, user_db[0].username, user_db[0].password)
        let getinfo = await database.prepare("SELECT userid, username, Session FROM auth WHERE Session= ?;");
        let sessioninfo = getinfo.all(Session.Session)
        
        res.status(202).json({message: 'login successful', session: Session, username : sessioninfo[0].username, userid : sessioninfo[0].userid});
        
      } else{
        res.status(401).json({message : "Bad username or password"})
      }
    }else{
      res.status(400).json({message : "Bad Request, client js error"});
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

//sign up page -- DO NOT MOVE BELOW THE AUTH MIDDLEWARE
app.route('/signup')
  .get((req, res) => {
    res.sendFile(path.join(__dirname + '/html/signup.html'))
  })
  .post(async (req, res) => {
      let firstName= req.body.firstName;
      let lastName= req.body.lastName;
      let password = req.body.password;
      let username = req.body.username;
      if(firstName && lastName && password && username){
        let Available = await checkAvailable(username);
        if(Available){  
        let id = await storeNewAuth(username, password)
        storeNewUser(firstName, lastName, id)
        res.status(202).json({message : "user successfully created"})
        }else{
          res.status(409).json({message : "username already in use"})
        }
      }else{
        res.status(400).json({message : 'Malformed Request'})
      }
  })

//check auth middleware -- ANYTHING UNDER THIS MUST GIVE AUTH HEADERS
app.use( async (req,res, next) => {
  if(req.headers['authorization']){
    let sessioninf = await JSON.parse(req.headers['authorization']);
    try{var session = sessioninf.session;
    var auth = sessioninf.sig;}
    catch(err){
      res.status(401);
    }
  }
  if(session && auth){
    let authed = await verifySession(session, auth)
    if(authed){
      next()
    }else{
      res.status(401).redirect('/')
    }
  }else{
    res.status(400).redirect('/');
    
  }
})


//homepage
app.route('/menu')
  .get(async (req, res)=>{
    res.sendFile(path.join(__dirname + "/html/menu.html"));
  })

app.route('/main')
  .get(async (req, res) => {
    res.sendFile(path.join(__dirname + "/html/main.html"))
  })



/*#####################################################################################
FUNCTION AREA 
#####################################################################################*/
//session key generator
async function genSession (username, userid){
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
  let SignedEncryp = {
    sig : SessionSig.toString('base64'),
    Session: Session.toString('base64'),
  }
  return SignedEncryp;
}

//session expiration and authentication 
async function verifySession(data, sig){
// Verify signature over the encrypted session
  let decryptedBuf = await crypto.privateDecrypt(
    {
      key: PrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(data, 'base64')
  );
  let datajson = JSON.parse(decryptedBuf)
  let expire = datajson.exp;
  if(expire >= Math.floor(Date.now() / 1000)){
    var isValid = crypto.verify(
      'sha256',
      Buffer.from(data, 'base64'),
      {
        key: PublicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(sig, 'base64')
    );
      if(isValid){
        let getUser = database.prepare('SELECT username FROM auth WHERE Session = ?')
        let checkStat = getUser.all(data);
        if(checkStat.length >= 1){return true}
      }else{
        return false
      }
  }
  else{
    return false
  }
}
async function checkAvailable(username) {
  let user64 = await Buffer.from(username).toString('base64')
  let check = database.prepare("SELECT userid FROM auth WHERE username = ?")
  let Available = check.all(user64)
  if(Available.length != 0){
    return false
  }else{
    return true;
  }
}

//store the username & password into the auth table
async function storeNewAuth(username, password) {
  let username64 = await Buffer.from(username).toString('base64')
  let passwordHash = await bcrypt.hash(password, 12)
  try{let insertUser = database.prepare("INSERT INTO auth(username, password) VALUES (?, ?)")
  insertUser.run(username64, passwordHash)
  let getid = database.prepare("SELECT userid FROM auth WHERE username = ? ")
  let id = getid.all(username64)
  return id[0].userid;
  }
  catch(err){
    throw err
  }
}

//store the first & last name aswell as the id and date made in users
async function storeNewUser(first, last, id) {
  let time = new Date().toUTCString();
  let first64 = await Buffer.from(first).toString('base64')
  let last64 = await Buffer.from(last).toString('base64')
  try{
    let insertId = database.prepare('INSERT INTO users(userid) VALUES (?)')
    await insertId.run(id)
    let insertUser = database.prepare("UPDATE users SET first = ?, last = ?, made = ? WHERE userid = ?")
    await insertUser.run(first64, last64, time, id)
    return true
  }catch(err){
    throw err;
  } 
}
/**#######################################################################################
 * END OF FUNCTION AREA
 * #######################################################################################
 */



app.listen(port, () => {
  console.log(`Currently Listening on ${port}`)
})
