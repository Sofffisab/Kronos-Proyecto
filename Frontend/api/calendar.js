export function connectGoogleCalendar() {
  const location = `http://localhost:3000/auth/google`;
  window.open(location, '_blank', 'noopener,noreferrer');
}
export async function fetchEvents(token) {
    
    const response = await fetch('http://localhost:3000/api/calendar/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    
      const responseData = await response.json();
     if(!response.ok) {throw new Error(responseData.error ||'error '+response.status)
        
    }

    const formatted = responseData.map(ev => ({
      id: ev.id,
      title: ev.summary,
      start: ev.start?.dateTime || ev.start?.date,
      end: ev.end?.dateTime || ev.end?.date,
    }));
    return formatted
}

export const postEvent = async (token, event) => {
     const res = await fetch('http://localhost:3000/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    });

    if (res.ok) fetchEvents();
const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error creating event');

  return data; 
}