/**
 * Google Calendar API Service
 * Fetches upcoming meal events from a public Google Calendar
 */

const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

/**
 * Fetches calendar events starting from today
 * Parses description for keywords: "Sedge", "Wellow", "In Pantry"
 * Extracts URL from description for matching with menu items
 * 
 * @param {string} calendarId - The Google Calendar ID to fetch events from
 * @returns {Promise<Array>} Array of calendar events
 */
export const fetchCalendarEvents = async (calendarId) => {
  if (!API_KEY) {
    console.warn("Google Calendar API key not configured");
    return [];
  }

  if (!calendarId) {
    console.warn("No calendar ID provided");
    return [];
  }

  try {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?key=${API_KEY}&timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=50`;

    console.log("Fetching calendar events from:", calendarId);
    console.log("API Key exists:", !!API_KEY);
    console.log("API Key prefix:", API_KEY?.substring(0, 10) + "...");

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Calendar API Error Response:", errorData);
      
      if (response.status === 403) {
        console.error("Calendar access forbidden (403 error)");
        console.error("Calendar ID:", calendarId);
        console.error("Common causes:");
        console.error("1. Calendar API not enabled in Google Cloud Console");
        console.error("2. API key has incorrect restrictions (HTTP referrer, IP, etc.)");
        console.error("3. API key doesn't have Calendar API enabled");
        console.error("Error details:", errorData.error?.message);
        
        throw new Error(`Calendar API access denied. ${errorData.error?.message || 'Check API key configuration in Google Cloud Console.'}`);
      }
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

