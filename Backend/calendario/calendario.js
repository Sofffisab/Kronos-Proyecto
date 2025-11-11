import { prisma } from '../prisma/prisma.js';
import pkg from 'googleapis'; 
const { google } = pkg;
import dotenv from 'dotenv';
dotenv.config();



const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const setupcalendario = () => {

  const authorization = (personaId) => {
    const state = Buffer.from(JSON.stringify({ personaId })).toString('base64');
    const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: state,
    });
    return url;
  };
  
  const getatoken = async (code, personaId) => {
      try {
          const { tokens } = await oAuth2Client.getToken(code);
          
          if (!tokens.refresh_token) {
          console.error('No refresh token received');
          throw new Error('No refresh token provided by Google.');
          }
      
          await prisma.persona.update({ 
              where: { 
                  id: personaId 
              }, 
              data: { 
                  googleRefreshToken: tokens.refresh_token 
              }
          });
          return tokens;

      } catch (error) {
          console.error('Error taking tokens', error);
          throw error;
      };
  };

  const lookfortoken = async (tokenrenewed) => {
    if (!tokenrenewed) {
    console.error("No refresh token provided for calendar access.");
    throw new Error("No token provided");
    };
    
    oAuth2Client.setCredentials({
      refresh_token: tokenrenewed,
    });
  
    const { token } = await oAuth2Client.getAccessToken();
      if (!token) {
      throw new Error("Failed to get access token");
    }


    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    return calendar;
  };

  const permision = async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    if (!code) {
      return res.status(400).json('No authorization code provided');
    };

    if (!state) {
      return res.status(400).json({ error: 'No state provided' });
    }
    
    try {
      const { personaId } = JSON.parse(Buffer.from(state, 'base64').toString());
      await getatoken(code, personaId);
      res.json({ message: 'Authorization successful' });
    } catch (error) {
      console.error('Authorization failed:', error);
      res.status(500).json({ 
        error: "Internal Server Error",
        retry: true 
      });
    };

  };

  const getevents = async (req, res) => {
    try {
      const personaId = req.personaId; 
      const persona = await prisma.persona.findUnique({
        where: { id: personaId },
        select: { googleRefreshToken: true }
      });

      if (!persona || !persona.googleRefreshToken) {
        return res.status(401).json('User not linked to a Google account');
      };

      const calendar = await lookfortoken(persona.googleRefreshToken);
      const events = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      res.json(events.data.items);

    } catch (error) {
      console.error('Failed to get events:', error);
      res.status(500).json({ 
        error: "Internal Server Error",
        retry: true 
      });
    };
  };

  const redirectwithgoogle = async (req, res) => {
    const personaId = req.personaId;
    const url = authorization(personaId);
    res.redirect(url);
  };
 
  const createevents = async (req, res) => {
    try {
      const personaId = req.personaId;
      const eventdetails = req.body;

      if (!eventdetails || Object.keys(eventdetails).length === 0) {
        return res.status(400).json({ error: 'No event details provided'});
      };

      const persona = await prisma.persona.findUnique({
        where: { 
          id: personaId 
        },
        select: { 
          googleRefreshToken: true 
        }
      });

      if (!persona || !persona.googleRefreshToken) {
        return res.status(401).json({ error: 'User not linked to a Google account' });
      };

      const calendar = await lookfortoken(persona.googleRefreshToken);
      const res_event = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventdetails,
      });
      res.status(201).json(res_event.data);

    } catch (error) {
      console.error('Failed to create event:', error);
      const isAuthError = error.code === 401 || error.message?.includes('invalid_grant');
      res.status(isAuthError ? 401 : 500).json({ 
        error: isAuthError ? 'Calendar access expired. Please reconnect' : 'Failed to create event',
        retry: !isAuthError, 
        needsReauth: isAuthError
      });
    };
  };

  const deleteevents = async (req, res) => {
    try {
      const { eventId } = req.params;
      const personaId = req.personaId;

      const persona = await prisma.persona.findUnique({
        where: { id: personaId },
        select: { googleRefreshToken: true }
      });

      if (!persona || !persona.googleRefreshToken) {
        return res.status(401).json('User not linked to a Google account');
      };

      const calendar = await lookfortoken(persona.googleRefreshToken);
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      res.status(204).json();
    } catch (error) {
      console.error('Failed to delete event:', error);
      const isAuthError = error.code === 401 || error.message?.includes('invalid_grant');
      res.status(isAuthError ? 401 : 500).json({ 
        error: isAuthError ? 'Calendar access expired. Please reconnect' : 'Failed to create event',
        retry: !isAuthError, 
        needsReauth: isAuthError
      });
    };
  };

  const updateevents = async (req, res) => {
    try {
      const { eventId } = req.params; 
      const eventdetails = req.body; 
      const personaId = req.personaId;

      const persona = await prisma.persona.findUnique({
        where: { id: personaId },
        select: { googleRefreshToken: true }
      });

      if (!persona || !persona.googleRefreshToken) {
        return res.status(401).json('User not linked to a Google account');
      };

      const calendar = await lookfortoken(persona.googleRefreshToken);
      const updatedEvent = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: eventdetails,
      });

      res.status(200).json(updatedEvent.data);

    } catch (error) {
      console.error('Failed to update event:', error);
      const isAuthError = error.code === 401 || error.message?.includes('invalid_grant');
      res.status(isAuthError ? 401 : 500).json({ 
        error: isAuthError ? 'Calendar access expired. Please reconnect' : 'Failed to create event',
        retry: !isAuthError, 
        needsReauth: isAuthError
      });
    };
  };

  return {
    authorization,
    getatoken,
    lookfortoken,
    permision,
    getevents,
    redirectwithgoogle,
    createevents,
    deleteevents,
    updateevents,
  };
};

export default setupcalendario;
