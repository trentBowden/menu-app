/**
 * Google Calendar API Service
 * Fetches upcoming meal events from a public Google Calendar
 */

const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const CALENDAR_ID = import.meta.env.VITE_PUBLIC_MEAL_CALENDAR_ID;

/**
 * Fetches calendar events starting from today
 * Parses description for keywords: "Sedge", "Wellow", "In Pantry"
 * Extracts URL from description for matching with menu items
 */
export const fetchCalendarEvents = async () => {
  if (!API_KEY || !CALENDAR_ID) {
    console.warn("Google Calendar API credentials not configured");
    return [];
  }

  try {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?key=${API_KEY}&timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=50`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.items || []).map((event) => {
      const description = event.description || "";
      
      // Extract keywords
      const keywords = ["Sedge", "Wellow", "In Pantry"].filter((keyword) =>
        description.includes(keyword)
      );
      
      // Extract URL (look for http/https links)
      const urlMatch = description.match(/(https?:\/\/[^\s]+)/);
      const url = urlMatch ? urlMatch[0] : null;
      
      return {
        id: event.id,
        title: event.summary || "Untitled Meal",
        start: event.start?.dateTime || event.start?.date,
        description: description,
        keywords: keywords,
        url: url,
      };
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};

