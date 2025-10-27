

export const login = async (email,pass)=> {
    const response = await fetch('http://localhost:3000/users/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json'},
body: JSON.stringify({mailI: email,
    usuarioI: email, 
    constraseniaP: pass })
})
if(!response.ok)  throw new Error('error '+response.status)
const responseData = await response.json()
return responseData;
}



   export const register = async (nombre, email, pass, foto) => {

     {
    const response = await fetch('http://localhost:3000/users/signup', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json'},
         body: JSON.stringify({
             mail: email, 
             contraseniaPrior: pass,
            usuario: nombre,
            nombre: nombre, })
         })
         if(!response.ok) throw new Error('error '+response.status)
         const responseData = await response.json();
         return responseData
         
   }}
