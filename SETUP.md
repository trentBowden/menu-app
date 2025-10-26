# 🚀 Hula Eats - Setup Guide

## ✅ What's Been Built

Your Hula Eats MVP is now complete! Here's what's implemented:

### Core Architecture ✨

- ✅ Redux Toolkit store with 4 slices (auth, calendar, menu, restaurants)
- ✅ Firebase Realtime Database integration
- ✅ Firebase Authentication (Google Sign-In)
- ✅ Google Calendar API integration
- ✅ Dumb components architecture (all logic in Redux)
- ✅ Mobile-first, responsive design with Tailwind CSS

### Features Implemented 🎯

#### 1. Authentication

- Google Sign-In button
- Auth state listener that syncs with Redux
- Protected routes (must sign in to use app)

#### 2. Three-Tab Layout (Swipeable!)

- **Home Tab**: Upcoming meals, recent activity, restaurants
- **All Tab**: Grid view of all menu items with quick "Craving" button
- **New Tab**: Form to create new menu items with multiple recipes

#### 3. Menu Items

- Create items with multiple recipes (1-N)
- Composite image display (splits images side-by-side for multi-recipe items)
- Each recipe can have:
  - Title
  - Image URL
  - Original recipe link
  - Coles shopping list link
- Links can be added/edited in the detail modal

#### 4. Response System

- Three response types: "Nah", "Interested", "Craving"
- 24-hour cooldown logic (user can respond again after 24h)
- Response buttons show selected state
- User avatars displayed on cards for recent responders

#### 5. Calendar Integration

- Fetches upcoming meals from Google Calendar
- Matches calendar events to menu items by URL
- Shows pastel-colored placeholders for unmatched meals
- Displays keywords from event descriptions

#### 6. Real-time Data

- Live listeners on Firebase RTDB for menu items and restaurants
- Automatic UI updates when data changes
- All CRUD operations work in real-time

## 🔧 Next Steps

### 1. Set Up Firebase

If you haven't already:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Authentication** → **Google Sign-In**
4. Enable **Realtime Database**
5. Set database rules (for testing, use these):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

6. Copy your Firebase config to `.env`:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

### 2. Set Up Google Calendar (Optional)

For the upcoming meals feature:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select a project
3. Enable **Google Calendar API**
4. Create an **API Key** (restrict to Calendar API)
5. Create a public calendar in Google Calendar
6. Copy Calendar ID (Settings → Calendar ID)
7. Add to `.env`:

```bash
VITE_GOOGLE_CALENDAR_API_KEY=your_api_key
VITE_PUBLIC_MEAL_CALENDAR_ID=your_calendar_id@group.calendar.google.com
```

### 3. Run the App

```bash
npm run dev
```

The app should open at `http://localhost:5173`

## 🎨 How to Use

### Creating Your First Menu Item

1. Sign in with Google
2. Click the **New** tab
3. Enter a menu item title (e.g., "Taco Night")
4. Add recipes:
   - Recipe title (required)
   - Image URL (optional, but recommended)
   - Recipe link (can add later)
   - Shopping list link (can add later)
5. Click **Create Menu Item**

### Adding Responses

1. Go to **All** tab
2. Click the 🤤 **Craving** button for a quick response
3. Or click the card to open the detail modal
4. Choose: 👎 Nah, 🤔 Interested, or 🤤 Craving
5. You can respond again after 24 hours

### Editing Links

1. Click any menu item card
2. In the detail modal, find the recipe
3. Click **+ Add Link** if no link exists
4. Or click the ✏️ icon to edit an existing link
5. Enter the URL and click **Save**

## 🐛 Troubleshooting

### Auth Not Working

- Check Firebase console that Google Sign-In is enabled
- Verify `.env` has correct Firebase credentials
- Check browser console for errors

### Data Not Saving

- Check Firebase Realtime Database rules allow read/write
- Verify you're signed in
- Check network tab for failed requests

### Calendar Not Loading

- Verify Google Calendar API key is valid
- Check Calendar ID is correct and calendar is public
- This feature is optional - app works fine without it

## 🎯 What's Working

All core MVP features from INSTRUCTIONS.md are implemented:

- ✅ Redux-centric architecture
- ✅ Dumb components
- ✅ Modular file structure
- ✅ Firebase RTDB + Auth
- ✅ Swipeable tabs
- ✅ Composite images
- ✅ Response system with 24h cooldown
- ✅ Link editing
- ✅ Calendar integration
- ✅ Real-time updates

## 📱 Mobile Testing

The app is mobile-first. To test:

1. Open in browser
2. Press F12 for DevTools
3. Click device toolbar icon
4. Select a mobile device
5. Swipe between tabs!

## 🔜 Future Enhancements (Not in MVP)

Ideas for later:

- Search and filter menu items
- Restaurant menu management
- Multiple meal plans
- Grocery list aggregation
- Recipe image upload
- User preferences
- Notifications

---

**You're all set!** 🎉

The app is ready to use. Just add your Firebase credentials to `.env` and start the dev server!
