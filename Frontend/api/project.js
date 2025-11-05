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
    const response = await fetch(`http://localhhost:3000/${projId}/invite`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
        'authorization': `bearer ${token}`
    },
    body: {
        mail: mail,
    }
    })
    const responseData = await response.json()
    if(!response.ok) throw new Error(responseData.error || `error ${responseData.status}`)
    return(responseData )
}


export const stringToColor = (str)=> {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).slice(-2);
    }
  
    return color;
  }
  
  