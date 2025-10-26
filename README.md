# 🌺 Hula Eats - Family Menu Planning App

A mobile-first, serverless React application for family meal planning, built with Redux Toolkit, Firebase, and Google Calendar integration.

## 🏗️ Architecture

- **Framework**: React 19 + Vite
- **State Management**: Redux Toolkit (Redux-centric architecture)
- **Backend**: Firebase Realtime Database + Firebase Authentication
- **Styling**: Tailwind CSS
- **UI Pattern**: Dumb components (components only read from Redux and dispatch actions)

## 📁 Project Structure

```
src/
├── app/
│   └── store.js                 # Redux store configuration
├── services/
│   ├── firebase.js              # Firebase initialization and helpers
│   └── googleCalendar.js        # Google Calendar API integration
├── features/
│   ├── auth/
│   │   ├── authSlice.js         # Auth state management
│   │   └── LoginButton.jsx      # Google Sign-In component
│   ├── calendar/
│   │   ├── calendarSlice.js     # Calendar state management
│   │   └── UpcomingMeals.jsx    # Horizontal scrolling meal list
│   ├── menu/
│   │   ├── menuSlice.js         # Menu state management
│   │   ├── MenuItemCard.jsx     # Card with composite images
│   │   ├── MenuItemList.jsx     # Vertical list of all items
│   │   └── MenuItemDetailModal.jsx # Detail view with actions
│   ├── restaurants/
│   │   ├── restaurantSlice.js   # Restaurant state management
│   │   └── RestaurantList.jsx   # Restaurant display component
│   └── responses/
│       └── responseLogic.js     # Helper functions for response timestamps
├── pages/
│   ├── HomePage.jsx             # Home tab content
│   ├── AllItemsPage.jsx         # All Items tab content
│   └── NewItemPage.jsx          # New Item form
├── components/
│   ├── layout/
│   │   └── MainLayout.jsx       # Main layout with swipeable tabs
│   └── common/
│       ├── LoadingSpinner.jsx   # Loading indicator
│       └── SkeletonCard.jsx     # Skeleton loading state
├── hooks/
│   └── useAuthListener.js       # Firebase Auth state sync hook
└── App.jsx                      # Main app entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Realtime Database and Authentication enabled
- Google Calendar API key (optional, for calendar integration)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd menu-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

   - Add your Firebase credentials
   - Add your Google Calendar API key and Calendar ID (optional)

5. Start the development server:

```bash
npm run dev
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Google Authentication in Authentication → Sign-in method
3. Enable Realtime Database in Database
4. Copy your Firebase config credentials to `.env`

### Google Calendar Setup (Optional)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Calendar API
3. Create an API key
4. Create a public calendar and copy its Calendar ID
5. Add both to your `.env` file

## ✨ Features

### 📱 Mobile-First Design

- Swipeable tabs (Home, All, New)
- Touch-optimized interface
- Responsive grid layouts

### 🍽️ Menu Management

- Create menu items with multiple recipes
- Composite image display (1-N recipes shown side-by-side)
- Add links to original recipes and shopping lists
- Quick "Craving" button for instant responses

### 👥 Response System

- Three response types: "Nah", "Interested", "Craving"
- 24-hour cooldown on responses
- User avatars shown on recently responded items

### 📅 Calendar Integration

- Displays upcoming meals from Google Calendar
- Matches calendar events to menu items by URL
- Shows keywords from event descriptions

### 🔐 Authentication

- Google Sign-In via Firebase Auth
- User-specific responses and actions
- Secure data access

## 🎨 UI Components

### MenuItemCard

- Displays menu item with composite images
- Shows most recent responder's avatar
- Quick craving button option

### MenuItemDetailModal

- Full item details
- Recipe links (original + shopping list)
- In-place link editing
- Response action buttons

### UpcomingMeals

- Horizontal scrolling list
- Matches calendar events to menu items
- Pastel-colored placeholders for unmatched events

## 🗄️ Data Models

### MenuItem

```javascript
{
  id: "firebase-push-id",
  title: "Taco Feast",
  createdBy: "user-uid",
  recipes: [
    {
      title: "Spicy Chicken",
      originalRecipeLink: "https://...",
      colesOrderListLink: "https://...",
      imageURL: "https://..."
    }
  ],
  responses: [
    {
      userId: "user-uid",
      type: "Craving",
      timestamp: 1678886400000
    }
  ]
}
```

### Restaurant

```javascript
{
  id: "firebase-push-id",
  name: "Local Pizza Place",
  menuItemIds: ["menu-item-id-1", "menu-item-id-2"]
}
```

## 🔄 State Management

All application state is managed through Redux Toolkit:

- **authSlice**: User authentication state
- **calendarSlice**: Upcoming meals from Google Calendar
- **menuSlice**: Menu items with async RTDB listeners
- **restaurantSlice**: Restaurant data with async RTDB listeners

Components are "dumb" - they only:

1. Read from Redux using `useSelector`
2. Dispatch actions using `useDispatch`

All business logic and API calls are in Redux thunks.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Technologies

- React 19
- Redux Toolkit
- Firebase (Auth + Realtime Database)
- Tailwind CSS
- React Swipeable Views
- Vite

## 📄 License

This project is for personal use.

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!
