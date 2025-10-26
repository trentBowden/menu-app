/**
 * Helper functions for response timestamp logic
 */

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get the most recent response for a specific user on an item
 * @param {Array} responses - Array of response objects
 * @param {string} userId - User ID to filter by
 * @returns {Object|null} Most recent response or null
 */
export const getMostRecentUserResponse = (responses, userId) => {
  if (!responses || !Array.isArray(responses)) return null;
  
  const userResponses = responses.filter((r) => r.userId === userId);
  if (userResponses.length === 0) return null;
  
  return userResponses.reduce((latest, current) => {
    return current.timestamp > latest.timestamp ? current : latest;
  });
};

/**
 * Check if a response timestamp is older than 24 hours
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {boolean} True if older than 24 hours
 */
export const isResponseExpired = (timestamp) => {
  const now = Date.now();
  return now - timestamp > TWENTY_FOUR_HOURS;
};

/**
 * Check if user can respond again (no recent response or last response is > 24h old)
 * @param {Array} responses - Array of response objects
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user can respond
 */
export const canUserRespond = (responses, userId) => {
  const mostRecent = getMostRecentUserResponse(responses, userId);
  if (!mostRecent) return true;
  return isResponseExpired(mostRecent.timestamp);
};

/**
 * Get the most recent response from any user on an item
 * @param {Array} responses - Array of response objects
 * @returns {Object|null} Most recent response or null
 */
export const getMostRecentResponse = (responses) => {
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return null;
  }
  
  return responses.reduce((latest, current) => {
    return current.timestamp > latest.timestamp ? current : latest;
  });
};

/**
 * Sort menu items by most recent response timestamp
 * @param {Array} items - Array of menu items
 * @returns {Array} Sorted array of menu items
 */
export const sortItemsByRecentResponses = (items) => {
  return [...items].sort((a, b) => {
    const aRecent = getMostRecentResponse(a.responses);
    const bRecent = getMostRecentResponse(b.responses);
    
    if (!aRecent && !bRecent) return 0;
    if (!aRecent) return 1;
    if (!bRecent) return -1;
    
    return bRecent.timestamp - aRecent.timestamp;
  });
};

