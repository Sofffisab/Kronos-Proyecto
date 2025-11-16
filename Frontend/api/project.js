import {createChat} from './messages.js'

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
    await createChat(nombre, token, responseData.project.id)
        return(responseData)
}

export const getProjects = async (token, id)=> {
    let projectId;
    if(id) projectId = '/'+id
    const response = await fetch(`http://localhost:3000/api/projects${projectId || ''}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json',
                 'authorization':`bearer ${token}`}
    })
    
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.errorr || 'error '+responseData.status)
    return(responseData)
}

export const getTasks = async (token, id) => {
    const response = await fetch(`http://localhost:3000/api/projects/${id}/tasks`,{
        method: 'GET',
        headers: {'Content-Type': 'application/json',
            'authorization': `bearer ${token}`
        }
})
const responseData = await response.json()
if(!response.ok) throw new Error(responseData.error || `error ${responseData.status}`)
    return(responseData )
}

export const inviteToProject = async (projId, mail, token) => {
    const response = await fetch(`http://localhost:3000/api/projects/${projId}/invite`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
        'authorization': `bearer ${token}`
    },
    body: JSON.stringify({
        mail: mail,
    })
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || `error ${responseData.status}`)
    return(responseData )
}

export const deleteProject = async (id, token) => {

    const response = await fetch(`http://localhost:3000/api/projects/${id}`,{
        method: 'DELETE',
            headers: {'Content-Type': 'application/json',
        'authorization': `bearer ${token}`}
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || `error ${responseData.status}`)
    return(responseData )

}

export const joinProject = async (codigo, token) => {

    const response = await fetch(`http://localhost:3000/api/projects/join`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json',
        'authorization': `bearer ${token}`},
        body: JSON.stringify({
            codigo: codigo
        })
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || `error ${responseData.status}`)
    return(responseData )
}

export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;

    const pastel = Math.floor((value + 255) / 2);  

    color += ("00" + pastel.toString(16)).slice(-2);
  }

  return color;
};
  
  