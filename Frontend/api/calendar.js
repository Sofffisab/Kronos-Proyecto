export async function connectGoogleCalendar() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Missing auth token for Google calendar connection');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/auth/google/url', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || !data?.url) {
      throw new Error(data?.error || 'Failed to fetch Google auth URL');
    }

    window.open(data.url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Unable to initiate Google calendar sync:', error);
  }
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

export const deleteEvent = async (id, token) => {

  const res = await fetch(`http://localhost:3000/api/calendar/events/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res && !res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error deleting event');
  }

  return true;
}