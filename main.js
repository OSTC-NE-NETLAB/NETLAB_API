// imported packages
const express = require('express');
const app = express()
const toml = require('toml');
const { DatabaseSync } = require('node:sqlite');
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
"║                       LAST UPDATE:  10/01/25                        ║\n"+
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
  let Auth = database.prepare("SELECT userid, username, password FROM auth WHERE username= ?")
  let AuthData = await Auth.all(Buffer.from(username).toString('base64'))
  if(AuthData[0]){
    let AuthCheck = await bcrypt.compare(password, AuthData[0].password)
    return AuthCheck;
  }else{  
    return false;
  }
}
async function makeNewUser(username, password, first, last) {
  try{
    let passwordcrypt = await bcrypt.hash(password, 12)
    let Auth = database.prepare("INSERT INTO auth(username, password) VALUES (?,?)")
    await Auth.run(Buffer.from(username).toString('base64'), passwordcrypt);
    let getId = database.prepare("SELECT userid FROM auth WHERE username = ?")
    let Id = await getId.all(username);
    let insertUser = database.prepare('INSERT INTO users(userid, first, last, made) VALUES (?, ?, ?, ?) ')
    await insertUser.run(Id.userid, first, last, new Date().now.toString())
    return true
  }catch(err){
    return false
  }
  
}
async function getSession(username) {
  let Auth = database.prepare("SELECT userid, username FROM auth WHERE username = ?")
  let AuthData = await Auth.all(Buffer.from(username).toString('base64'));
  if(AuthData[0].username && AuthData[0].userid){
    let session = {
      username : AuthData.username,
      userid : AuthData.password,
      date : Math.floor(new Date())
    }
    let NewSession = bcrypt.hash(JSON.stringify(session), 12);
    let SetSession = database.prepare("UPDATE auth SET Session = ? WHERE username = ?")
    await SetSession.run(NewSession, username)
    return NewSession
  }else{
    return false;
  }

}
async function checkSession(session) {
    let getAuth = database.prepare("SELECT userid FROM auth WHERE Session=?")
    let auth = getAuth.all(session)
    if(auth.length = 1){
      return true
    }else{
      return false
    }
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
    .post(async (req, res) => {
      let username = req.body.username;
      let password = req.body.password;
      if(username && password){
        let checkAuth = await AuthenticateUser(username, password);
        if(checkAuth){
          let session = await getSession(username)
          if(session != undefined){
              res.cookie("session", session, {
                httpOnly : true,
                maxAge : 60 * 60 * 1000,
                path: '/',
              }).status(202).send()
          }else{
            res.status(500).json({message : "There was a problem proccessing the request"})
          }
        }else{
          res.status(401).json({message : "Invalid username or password"})
        }
      }else{
        res.status(400).json({message : "Malformed Request"})
      }
    })


app.route('/signup')
    .get((req, res) => {
      res.status(200).sendFile(path.join(__dirname + '/html/signup.html'))
    })
    .post((req, res) => {
      let username = req.body.username;
      let password = req.body.password;
      let first = req.body.first;
      let last = req.body.last;
      if(username && password && first && last){
        let successful = makeNewUser(username, password, first, last)
        if(successful){
          res.status(201).json({message : "Account Created"})
        }
        else{
          res.status(500).json({message : "Error while proccessing your request"})
        }
      }else{
        res.status(400).json({message : 'Malformed Request'})
      }
    })


// middleware for signin
app.use( async (req, res, next) =>{
  if(req.cookies.session){
    let auth  = checkSession(req.cookies.session);
    if(auth){next()}
  }else{
    res.status(401).redirect('/login')
  }
})

app.route('/signout')
  .get((req, res) => {
    res.clearCookie('session', {path : '/'}).redirect('/login')
  })
app.route('/home')
  .get((req, res) => {
    res.sendFile(path.join(__dirname + '/html/main.html'))
  })

app.route('/inventory')
  .get((req, res) => {
    res.sendFile(path.join(__dirname + '/html/inventory.html'))
  })

app.route('/inventory/:id')

app.listen(port, () =>{
  console.log(`NETLAB API IS LISTEN ON ${port}`)
})