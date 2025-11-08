export const postTask = async (nombre, limite, responsable, token, projectId, estado) => {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId}/tasks`, {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`},
            'body': JSON.stringify({
                nombre: nombre,
                limite: new Date (limite).toISOString(),
                id_persona_responsable: responsable,
                estado: estado,
            })
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || 'error '+responseData.status)
    return(responseData)
}

export const markTask = async (tareaId, estado, token) => {
    const response = await fetch(`http://localhost:3000/api/tasks/${tareaId}`,{
        method: 'PUT',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`},
            body: JSON.stringify({
                estado: estado
            })
    })
     const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || 'error '+responseData.status)
        
    return(responseData)
}



export const deleteTask = async (id, token) => {
   const response = await fetch(`http://localhost:3000/api/tasks/${id}`,{
    method: 'DELETE',
    headers: {'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`}}
   )

   const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || 'error '+responseData.status)
        
    return(responseData)

}