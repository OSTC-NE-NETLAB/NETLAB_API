# NETLAB_API
## API REQUEST OPTIONS
__GET '/login'__  ->
Gets the html, css, and jacscript for the login page

__POST '/login'__ ->
Please post the username and password in json format
one variable called username and one called password
should look like this:
`{"username" : "[entered username]", "password" : "[entered password]"}

## API RESPONCES
__POST 'login'__ ->
Responds with 4 variables, message, userid, username,
and token, it is recommened to store these variables in
local storage, except the message which only states 
whether or not the POST request succeeded or failed

