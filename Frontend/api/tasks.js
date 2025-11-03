export const postTask = async (nombre, limite, responsable, token, projectId) => {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId}/tasks`, {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`},
            'body': JSON.stringify({
                nombre: nombre,
                limite: new Date (limite).toISOString(),
                id_persona_responsable: responsable,
            })
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || 'error '+responseData.status)
    return(responseData)
}