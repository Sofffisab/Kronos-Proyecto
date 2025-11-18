export const saveIaData = async (tema, foto, codigo, token) => {

    const response = await fetch('/api/ia/analize/pages', {
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