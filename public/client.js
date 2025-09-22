
function nextPage(){
    
}
function sendForm(){
        let usernamein = document.getElementById('username').value;
        let passwordin = document.getElementById('password').value;
        let server_return;
        let response = {
            username : usernamein,
            password : passwordin
        }
        fetch(window.location.href, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
         },
         body: JSON.stringify(response)
        })
        .then(response => response.json())
        .then(data => server_return)
        .catch(error => console.error('Error:', error));
        localStorage.setItem('server_data', JSON.stringify(server_return))
        nextPage()
    }