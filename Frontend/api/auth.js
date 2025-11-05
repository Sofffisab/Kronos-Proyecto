



export const login = async (email,pass,)=> {
    const response = await fetch('http://localhost:3000/users/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json'},
body: JSON.stringify({mailI: email,
    usuarioI: email, 
    contraseniaP: pass })
})

const responseData = await response.json()  
if(!response.ok)  throw new Error(responseData.error ||'error '+response.status)
console.log(responseData)
return responseData;
}



   export const register = async (nombre, email, pass, foto) => {

     {
        foto = await foto[0].arrayBuffer()
        const bytes = new Uint8Array(foto)
    const response = await fetch('http://localhost:3000/users/signup', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json'},
         body: JSON.stringify({
             mail: email, 
             contraseniaPrior: pass,
            usuario: nombre,
            nombre: nombre,
        foto_perfil: bytes })
         })
         const responseData = await response.json();
         if(!response.ok) throw new Error(responseData.error ||'error '+response.status)
        
         return responseData
         
   }}

   export const verifyToken = async (token) => {{

       const response = await fetch('http://localhost:3000/api/projects', {
           method: 'GET',
           headers: {'Content-Type': 'application/json',
                    'authorization':`bearer ${token}`}
       })
       
       if(!response.ok) return false
       else return true
   }}
