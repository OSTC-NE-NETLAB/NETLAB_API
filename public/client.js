

async function sendForm(){
        let usernamein = document.getElementById('username').value;
        let passwordin = document.getElementById('password').value;
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
        })}catch(err) {throw err;}
        let data = await getdata.json();
        delete data.message;
        localStorage.setItem('userdata', JSON.stringify(data))
        console.log(data)
    }