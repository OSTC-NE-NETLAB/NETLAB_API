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
async function getInventory(){
  let getInventory = database.prepare("SELECT asset_id, name, category, description, date FROM inventory ORDER BY asset_id")
  let inventory = await getInventory.all()
  return inventory;
}
async function putInventory(asset_id, name, category, desc, date){
  let getInventory = database.prepare("SELECT asset_id FROM inventory")
  let inventory = await getInventory.all()
  if(inventory.length > 0){
    return false
  }else{
    let putInventory = database.prepare("INSERT INTO inventory(asset_id, name, category, description, date) VALUES (?,?,?,?,?)")
    try{
      putInventory.run(asset_id, name, category, desc, date);
      return true
    }catch(err){
      console.log(err)
      return false
    }
  }
  
}
async function removeInventory(asset_id){
  try{
    let query = database.prepare("SELECT asset_id FROM inventory WHERE asset_id =?")
    let check = query.all(asset_id)
    if(check.length == 1){
      let removal = database.prepare("DELETE FROM inventory WHERE asset_id = ?")
      removal.run(asset_id)
      return true
    }else{
      return false
    }
  }catch(err){
    console.log(err)
    return false
  }
}

async function getUserData(session){
  console.log(session)
  try{
    let user = {
      id        :   Number,
      username  :   String,
      first     :   String,
      last      :   String,
      made      :   String,
    };
    let query = database.prepare("SELECT userid, username FROM auth WHERE Session=?")
    let quser = await query.all(session)
    console.log(quser)
    user.id = quser[0].userid;
    user.username = quser[0].username;
    query = database.prepare("SELECT first, last, made WHERE userid =")
    quser = await query.all(user.id)
    user.first = quser[0].first;
    user.last = quser[0].last;
    user.made = quser[0].made;
    return user
  }catch(err){
    console.log(err)
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
  .post(async (req, res) => {
    let inventory = await getInventory()
    res.status(201).json(inventory);
  })
  .put(async (req, res) => {
    if(!req.body.remove && req.body.remove != undefined){ 
      if(req.body.asset_id && req.body.name && req.body.category && req.body.description && req.body.date){
        let asset_id = req.body.asset_id;
        let name = req.body.name
        let category = req.body.category
        let desc = req.body.description
        let date = req.body.date
        let status = await putInventory(asset_id, name, category, desc, date)
        if(status){
          res.status(202).json({message : "Inventory Successfully Updated"})
        }else{
          res.sendStatus(500)
        }
      }else{
        res.status(400).json({message : "Malformed Request"})
      }
    }else{
      if(req.body.asset_id){
        let check = await removeInventory(req.body.asset_id)
        if(check){
          res.status(202).json({message : "Removed Successfully"})
        }else{
          res.status(400).json({message : "No Matching Id"})
        }
      }else{
        res.status(400).json({message : "Malformed Request"})
      }
    }
  })

app.route('/inventory/:id')

app.route('/account')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/html/account.html'))
  })
  .post(async (req, res) => {
    let session = req.cookies.session;
    let userinf = await getUserData(session)
    if(userinf){
      res.status(200).json(userinf)
    }
    else{
      res.status(500).json({message : "Internal Error, Try again later"})
    }
  })



app.listen(port, () =>{
  console.log(`NETLAB API IS LISTEN ON ${port}`)
})