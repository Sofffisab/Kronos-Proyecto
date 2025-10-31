export const postProject = async (nombre,limite,token)=>{

    const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
        },
        body: JSON.stringify({
            nombre: nombre,
            limite: new Date(limite).toISOString(),

        })

    }) 
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || 'error '+responseData.status)
        return(responseData)
}
export const postTasks = async (id, nombre, limite, token) => {

    const response = await fetch(`http://localhost:3000/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: {'Content-Type':'application/json',
                    'authorization': `bearer ${token}`
        },
        body: JSON.stringify({
            nombre: nombre,
            limite: new Date(limite).toISOString(),
            proyectoId: id,
        })
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || 'error '+responseData.status)
        return(responseData)

}