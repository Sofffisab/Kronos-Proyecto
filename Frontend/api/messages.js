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


let socket = null;
let listeners = new Set();

export function connectChatSocket(token) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('conectado');
    return socket;
  }

  socket = new WebSocket("ws://localhost:3000/chat", token);

  socket.onopen = () => {
    console.log("conectado");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    listeners.forEach((callback) => callback(data));
  };

  socket.onclose = (event) => {
    console.log("descconectado", event.reason);
  };

  socket.onerror = (err) => {
    console.error("error websocket", err);
  };

  return socket;
}


export function onChatMessage(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback); 
}


export function sendChatMessage(chatId, mensaje) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("websocket no abierto");
    return;
  }
  socket.send(JSON.stringify({ chatId, mensaje }));
}


export function disconnectChatSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

