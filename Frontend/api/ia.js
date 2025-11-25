export const saveIaData = async (tema, foto, codigo, token) => {

    const response = await fetch('http://localhost:3000/api/ia/analize/pages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({

            archivos: codigo.map(file => ({
                nombre: file.name,
                lenguaje: file.name.split('.').pop(),
                codigo: file.content
            })),
            foto_pagina_jpg: foto,
            tema: tema, })
    });
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.message || 'Error saving IA data');
    }
    return data;
}

export const fetchIaChats = async (token) => {

    const response = await fetch(`http://localhost:3000/api/ia/analize/pages`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.message || 'Error fetching IA chats');
    }
    return data;
}