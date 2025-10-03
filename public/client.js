
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
async function getInventory(){
    try {let response = await fetch('/inventory', {
        method: 'POST',
        headers : {
            "Content-Type" : "application/json",
        },
    })
    if(!response.ok){throw new Error(`HTTP response is faulty code ${response.status}`)}
    let inventory = await response.json()
    let main = document.getElementById('InvBody')
    for(let i = 0; i < inventory.length; i++){
        
        let tr = document.createElement('tr')
        let id = document.createElement('td')
        let name = document.createElement('td')
        let category = document.createElement('td')
        let description = document.createElement('td')
        let date = document.createElement('td')
        tr.setAttribute('id', `inv${i}`)
        id.innerText = inventory[i].asset_id;
        name.innerText = inventory[i].name;
        category.innerText = inventory[i].category;
        description.innerText = inventory[i].description;
        date.innerText =inventory[i].date
        tr.append(id, name, category, description, date)
        main.append(tr)
    }

    }catch(err){
        throw err
    }
}
async function PutOrQuery(){
    let check = document.getElementById('dropdown').value;
    if(check == 0){
        await inputInventory()
        location.reload()
        return
    }else if(check == 1){
        await removeInventory()
        location.reload()
        return
    }
}
async function inputInventory(){
    let asset_id = document.getElementById('asset_id').value;
    let name = document.getElementById('name').value;
    let category = document.getElementById('category').value;
    let description = document.getElementById('description').value;
    let date = document.getElementById('date').value;
    let data = {
        asset_id    :   asset_id,
        name        :   name,
        category    :   category,
        description :   description,
        date        :   date,
        remove      : false
    }
    try {let response = await fetch('/inventory', {
        
        method: 'PUT',
        headers : {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(data),
    })
    if(response.ok){
        return true
    }else{
        return false
    }
    }catch(err){
        throw err
    }
}
async function removeInventory(){
    let asset_id = document.getElementById('asset_id').value;
    let name = document.getElementById('name').value;
    let category = document.getElementById('category').value;
    let description = document.getElementById('description').value;
    let date = document.getElementById('date').value;
    let data = {
        asset_id    :   asset_id,
        name        :   name,
        category    :   category,
        description :   description,
        date        :   date,
        remove      : true
    }
    try {let response = await fetch('/inventory', {
        
        method: 'PUT',
        headers : {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(data),
    })
    if(response.ok){
        return true
    }else{
        return false
    }
    }catch(err){
        throw err
    }
}