
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
                        let session = {
                                session : data.session.Session,
                                sig : data.session.sig,
                        }
                        localStorage.setItem('session', JSON.stringify(session))
                }catch(err){throw err}
                goHome()
        }else{
                console.log("bad response")
        }
        
    }

async function goHome(){
        try {await authFetch(window.location.origin + "/menu", {
        method: 'GET',
        headers: {
          'Content-Type': 'document/html'
         }
        })
        .then(response => response.text())
        .then(html => {
        document.documentElement.innerHTML = html;})
        }catch(err) {throw err;}
        getMainContent()
    }

async function getMainContent() {
        try {await authFetch(window.location.origin + "/main", {
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

        try {await authFetch(window.location.origin + "/signup", {
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

function authFetch(url, options = {}) {
        var token = localStorage.getItem('session'); 

         var defaultHeaders = {
              'Authorization': `${token}`,
              'Content-Type': 'application/json',
      };

       options.headers = {
       ...defaultHeaders,
      ...options.headers,
        };

    return fetch(url, options);
}
async function getInv(){
        try {await authFetch(window.location.origin + "/inventory", {
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
        try {await authFetch(window.location.hostname + "/inventory/update", {
        method: 'POST',
        body : JSON.stringify(data),
        })
        }catch(err) {throw err;}
}