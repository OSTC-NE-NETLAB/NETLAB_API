
async function signin() {
   let username =  document.getElementById('username').value
   let password = document.getElementById('password').value;
   let data = {
    username : username,
    password : password,
   }
   try{
    let response = await fetch('/login', {
        method : 'POST',
        body: data,
    })
   }catch(err){
    throw err
   }
   if(response.status == 201){
    document.location.href = document.location.href + '/'
   }
}