# Astro + Convex Real-time Chat Application

A modern, real-time chat application built with **Astro** and **Convex** that features comprehensive user management, message history, and live activity tracking.

## ✨ Features

### 💬 Real-time Chat
- Instant message delivery with Convex real-time subscriptions
- Live message updates without page refresh
- Message timestamps and author information

### 👥 User Management
- Automatic user creation and management
- Optional email registration for verified users
- User activity tracking and "last seen" timestamps
- Persistent user sessions with localStorage

### 📊 Live Statistics
- Real-time active user count
- Total users and message statistics
- User message history and analytics
- Recent activity monitoring

### 🎨 Modern UI
- Clean, responsive design with Tailwind CSS
- Real-time user status indicators
- Message bubbles with author avatars
- Sidebar with user statistics and online users

### 🔄 Activity Tracking
- Automatic user activity updates
- Online/offline status detection
- Smart activity tracking (only updates when user is active)
- Tab visibility detection for accurate presence

## 🚀 Tech Stack

- **Frontend**: Astro + React + TypeScript
- **Backend**: Convex (real-time database)
- **Styling**: Tailwind CSS
- **State Management**: Convex React hooks
- **Real-time**: Convex subscriptions

## 📁 Project Structure

```
/
├── convex/
│   ├── messages.ts      # Message queries and mutations
│   ├── users.ts         # User management functions
│   └── schema.ts        # Database schema
├── src/
│   ├── components/
│   │   ├── MessageList.tsx     # Chat message display
│   │   ├── MessageInput.tsx    # Message input with user management
│   │   ├── UserStats.tsx       # User statistics sidebar
│   │   └── OnlineUsers.tsx     # Live user activity
│   ├── layouts/
│   │   └── ChatLayout.astro    # Main layout
│   └── pages/
│       └── index.astro         # Main chat page
└── package.json
```

## 🛠️ Database Schema

### Users Table
- `name`: User display name
- `email`: Optional email for verification
- `lastSeen`: Timestamp of last activity
- Indexed by email and name for efficient lookups

### Messages Table
- `userId`: Reference to user who sent the message
- `author`: Display name (for backwards compatibility)
- `body`: Message content
- `timestamp`: When the message was sent
- Indexed by timestamp, user, and user+timestamp

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd astro-convex-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will create a new Convex project and provide you with the environment variables.

4. **Configure environment**
   Create a `.env` file with your Convex URL:
   ```
   CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:4321`

## 🎯 How It Works

### User Management
1. When a user enters their name, the system automatically creates or retrieves their user record
2. Optional email can be provided for verified user status
3. User activity is tracked automatically while they use the chat
4. "Last seen" timestamps are updated every 2 minutes during active use

### Real-time Updates
1. Messages appear instantly across all connected clients
2. User statistics update in real-time
3. Online/offline status is tracked with 5-minute activity windows
4. All data syncs automatically through Convex subscriptions

### Message History
1. Each message is linked to a user record
2. Full message history is maintained per user
3. Recent messages are displayed in user statistics
4. Message counts and activity stats are calculated in real-time

## 🔧 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`     |
| `npm run build`           | Build your production site to `./dist/`         |
| `npm run preview`         | Preview your build locally, before deploying    |
| `npx convex dev`          | Start Convex development environment             |
| `npx convex deploy`       | Deploy your Convex functions                     |

## 🎨 Customization

### Adding New Features
- **Message reactions**: Extend the messages schema and add UI
- **Chat rooms**: Use the existing rooms table and add room selection
- **File uploads**: Add file fields to messages and implement upload UI
- **Push notifications**: Integrate with browser notification API

### Styling
- Modify `src/styles/global.css` for global styles
- Component styles use Tailwind CSS classes
- Color scheme can be customized in Tailwind config

## 📚 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Convex Documentation](https://docs.convex.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).