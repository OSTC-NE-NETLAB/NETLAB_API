const { response } = require("express");

function goToSignup(){
        window.location.href = window.location.origin + '/signup';
}
function goToLogin(){
        window.location.href = window.location.origin + '/login';
}


async function attemptLogin(){
        let usernamein = document.getElementById('username').value;
        let passwordin = document.getElementById('password').value;
        var failed = false;
        var getdata;
        let send = {
            username : usernamein,
            password : passwordin
        }
        try {var getdata = await fetch(window.location.href, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
         },
         body: JSON.stringify(send)
        })
        }catch(err) {throw err;}
        if(await getdata.status != 202){
                failed = true
        }

        if(!failed){
                let data = await getdata.json();
                try{
                        delete data.message;
                        let userdata = {
                                userid : data.userid,
                                username : data.username
                        }
                        localStorage.setItem('userdata', JSON.stringify(userdata))
                }catch(err){throw err}
                goHome()
        }else{
                console.log("bad response")
        }
        
    }

async function goHome(){
        let post;
        try {post = await fetch(window.location.origin + "/menu", {
        method: 'GET',
        headers: {
          'Content-Type': 'document/html'
         }
        })
        }catch(err) {throw err;}
        if(post.status == 401){
                return 401;
        }else{  
                
                document.open();
                document.write(post.text());
                document.close();
                return 202;
        }
    }

async function getMainContent() {
        let post;
        try {post = await fetch(window.location.origin + "/main", {
        method: 'GET',
        headers: {
          'Content-Type': 'document/html'
         }
        })
        }catch(err) {throw err;}


        document.getElementById('content_window').setAttribute('srcdoc', post.text())
        
        
}

function signOut(){
        localStorage.removeItem('session');
        localStorage.removeItem('userdata');
        window.location.reload();
}
async function signUp(){
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let firstName = document.getElementById('first').value;
        let lastName = document.getElementById('last').value;
        let code;
        let data = {
                username : username,
                password : password,
                firstName : firstName,
                lastName : lastName,
        }

        try {await fetch(window.location.origin + "/signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
         },
        body: JSON.stringify(data)
        })
        .then(response => code = response.status())
        }catch(err) {throw err;}
        console.log(code)
}


async function getInv(){
        try {await fetch(window.location.origin + "/inventory", {
        method: 'GET',
        headers: {
          'Content-Type': 'document/html'
         }
        })
        .then(response => response.text())
        .then(content => {
        document.getElementById('content_window').setAttribute('srcdoc', content)})
        }catch(err) {throw err;}
}
async function putInv(){
        let asset = document.getElementById('asset_id').value;
        let category = document.getElementById('category').value;
        let description = document.getElementById('description').value;
        let date = document.getElementById('date').value;
        let data = {
            asset_id : asset,
            category : category,
            description: description,
            date : date
        }
        console.log(window.location)
        try {await fetch(window.location.hostname + "/inventory/update", {
        method: 'POST',
        body : JSON.stringify(data),
        })
        }catch(err) {throw err;}
        location.reload()
}
async function getItems(){
        let jsondata;
        try {await fetch(window.location.hostname + "/inventory/items", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
         }
        })
        .then(response=>response.json())
        .then(data=> jsondata = data)
        }catch(err) {throw err;}
        
        for (let i = 0; i < jsondata.length; i++){
                var tr = document.createElement('tr')
                var asset = document.createElement('td')
                var category = document.createElement('td')
                var description = document.createElement('td')
                var date = document.createElement('td')
                tr.setAttribute('id', `item${i}`)

                asset.innerHTML = jsondata[i].asset_id;
                category.innerHTML = jsondata[i].category;
                description.innerHTML = jsondata[i].description;
                date.innerHTML = jsondata[i].date;

                tr.appendChild(asset)
                tr.appendChild(category)
                tr.appendChild(description)
                tr.appendChild(date)

                document.getElementById('InvBody').appendChild(tr)
        }
}