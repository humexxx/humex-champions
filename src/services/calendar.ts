export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';
const ENDPOINT =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export async function createEvent(accessToken: string) {
  const event = {
    summary: 'Meeting with Team',
    start: {
      dateTime: '2024-10-18T10:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2024-10-18T11:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    const data = await response.json();
    console.log('Event Created:', data);
  } catch (error) {
    console.error('Error creating event:', error);
  }
}
