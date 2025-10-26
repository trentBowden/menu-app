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

/**
 * Get recent activity descriptions for a menu item
 * Shows only the most recent response per user, grouped by type
 * @param {Array} responses - Array of response objects
 * @param {number} hoursToLookBack - How many hours back to look (default 24)
 * @returns {Array} Array of activity description objects
 */
export const getRecentActivityDescriptions = (responses, hoursToLookBack = 24) => {
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return [];
  }

  const cutoffTime = Date.now() - (hoursToLookBack * 60 * 60 * 1000);
  
  // Filter to recent responses
  const recentResponses = responses.filter(r => r.timestamp >= cutoffTime);
  
  if (recentResponses.length === 0) {
    return [];
  }

  // First, get only the most recent response per user (across all types)
  const userMostRecent = {};
  recentResponses.forEach(response => {
    if (!userMostRecent[response.userId] || response.timestamp > userMostRecent[response.userId].timestamp) {
      userMostRecent[response.userId] = response;
    }
  });

  // Now group by response type
  const groupedByType = {};
  Object.values(userMostRecent).forEach(response => {
    if (!groupedByType[response.type]) {
      groupedByType[response.type] = [];
    }
    groupedByType[response.type].push(response);
  });

  // Generate descriptions
  const activities = [];
  const typeOrder = ['Craving', 'Interested', 'Nah']; // Priority order
  
  typeOrder.forEach(type => {
    if (groupedByType[type] && groupedByType[type].length > 0) {
      const users = groupedByType[type];
      const userNames = users.map(u => u.userName || 'Someone');
      
      let description;
      if (userNames.length === 1) {
        description = `${userNames[0]} ${type === 'Craving' ? 'craved' : type === 'Interested' ? 'interested' : 'passed on'} this`;
      } else if (userNames.length === 2) {
        description = `${userNames[0]} and ${userNames[1]} ${type === 'Craving' ? 'craved' : type === 'Interested' ? 'interested in' : 'passed on'} this`;
      } else {
        const others = userNames.slice(1).join(', ');
        description = `${userNames[0]}, ${others} ${type === 'Craving' ? 'craved' : type === 'Interested' ? 'interested in' : 'passed on'} this`;
      }
      
      activities.push({
        type,
        users,
        description,
        emoji: type === 'Craving' ? '🤤' : type === 'Interested' ? '🤔' : '👎',
      });
    }
  });

  return activities;
};

