export const createChat = async (nombre, token, projectId) =>{

    const response = await fetch(`http://localhost:3000/projects/${projectId}/chat/create`,{
    'method': 'POST',
    'headers': {
        'Content-Type': 'application/json',
        'authorization': `bearer ${token}`
    },
    'body': JSON.stringify({
        nombre: nombre
    })})
    const responseData = await response.json();
     if(!response.ok) throw new Error(responseData.error ||'error '+response.status)
        
    return responseData
}

export const getChatMessages = async (token, chatId) => {
    const response = await fetch(`http://localhost:3000/chat/${chatId}/messages`, {
        'method': 'GET',
        'headers': {
            'Content-Type': 'appliciation/json',
            'Authorization': `bearer ${token}`
        }
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error ||'error '+response.status)
        
    return responseData
}

export const postMessages = async () =>{}