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
  let Auth = database.prepare("SELECT userid, username, password FROM auth WHERE username= ?")
  let AuthData = await Auth.all(Buffer.from(username).toString('base64'))
  if(AuthData.username && AuthData.password){
    let AuthCheck = await bcrypt.compare(password, AuthData.password)
    return AuthCheck;
  }else{  
    return false;
  }
}
async function makeNewUser(username, password, first, last) {
  try{
    let passwordcrypt = await bcrypt.hash(password, 12)
    let Auth = database.prepare("INSERT INTO auth(username, password) VALUES (?,?)")
    await Auth.run(username, passwordcrypt);
    let getId = database.prepare("SELECT userid FROM auth WHERE username = ?")
    let Id = await getId.all(username);
    let insertUser = database.prepare('INSERT INTO users(userid, first, last, made) VALUES (?, ?, ?, ?) ')
    await insertUser.run(Id.userid, first, last, new Date().now.toString())
    return false
  }catch(err){
    return true
  }
  
}
async function getSession(username) {
  let Auth = database.prepare("SELECT userid, username FROM auth WHERE username = ?")
  let AuthData = await Auth.all(Buffer.from(username).toString('base64'));
  if(AuthData.username && AuthData.userid){
    let session = {
      username : AuthData.username,
      userid : AuthData.password,
      date : Math.floor(new Date(timeStamp).getMinutes())
    }
    return bcrypt.hash(JSON.stringify(session), 12);
  }else{
    return false;
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
        console.log(checkAuth)
        if(checkAuth){
          let session = await getSession(username)
          console.log(session)
          if(session){
              res.status(201).cookie("session", session, {
                httpOnly : true,
                maxAge : 60 * 60 * 1000,
              })
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
          res.send(200).json({message : "Account Created"})
        }
        else{
          res.send(500).json({message : "Error while proccessing your request"})
        }
      }else{
        res.status(400).json({message : 'Malformed Request'})
      }
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