

async function signIn() {
   let username =  document.getElementById('username').value
   let password = document.getElementById('password').value
   let data = {
    username : username,
    password : password,
   }
   let url = window.location.origin + '/Login'
   try{
    await fetch(url, {
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if(response.ok){
            window.location.href = window.location.origin + '/home'
        }else{  
            let error = response.json()
            document.getElementById('error').innerHTML = error.message;
        }
    })
    
   }catch(err){
    throw err
   }
}

async function signUp() {
   let username =  document.getElementById('username').value
   let password = document.getElementById('password').value
   let first = document.getElementById('password').value
   let last = document.getElementById('password').value
   let data = {
    username : username,
    password : password,
    first : first,
    last : last,
   }
   let url = window.location.origin + '/signup'
   try{
    await fetch(url, {
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if(response.ok){
            console.log('wow')
        }
    })
   }catch(err){
    throw err
   }
}