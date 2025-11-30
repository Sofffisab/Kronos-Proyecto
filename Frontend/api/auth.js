



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
        const body = new FormData()
        body.append('mail',email)
        body.append('contraseniaPrior', pass)
        body.append('usuario', email)
        body.append('nombre', nombre)

         if (foto && foto.length > 0) {
            body.append('foto_perfil', foto[0])
        } else if (foto instanceof File) {
            body.append('foto_perfil', foto)
        }

    const response = await fetch('http://localhost:3000/users/signup', {
         method: 'POST',
         body: body
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

   export const updateProfile = async (token, nombre, horario_inicio, horario_fin ) => {
    const baseDate = '1970-01-01';

    const response = await fetch('http://localhost:3000/api/users/me', {
        method: 'PUT',
        
        headers: {
            'Content-Type': 'application/json',
            'authorization':`bearer ${token}`},
        body: JSON.stringify({
            nombre: nombre,
            horario_inicio: new Date(`${baseDate}T${horario_inicio}:00Z`),
            horario_fin: new Date(`${baseDate}T${horario_fin}:00Z`)
        })
    })
    const responseData = await response.json();
    if(!response.ok) throw new Error(responseData.error ||'error '+response.status)
        return responseData
    } 

   