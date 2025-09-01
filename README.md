# Memora Journal App

A modern, AI-powered journaling application built with React, Node.js, and MongoDB.

## Features

### Core Functionality
- **Rich Text Journaling** - Write entries with a powerful rich text editor
- **Mood Tracking** - Select from 16 different mood options
- **Tag System** - Organize entries with custom tags
- **Image Upload** - Add images to journal entries with Cloudinary integration
- **Search & Filter** - Find entries by content, mood, or tags

### AI-Powered Features
- **AI Writing Prompts** - Get personalized writing suggestions
- **Entry Analysis** - Deep insights including mood analysis, key themes, and patterns
- **Period Summaries** - AI-generated summaries of your journaling journey
- **Smart Chat** - Context-aware AI assistant with access to your entries

### Analytics & Insights
- **Writing Streaks** - Track consecutive journaling days
- **Mood Distribution** - Visualize your emotional patterns
- **Popular Topics** - See your most used tags
- **Writing Times** - Discover when you prefer to journal
- **Monthly Goals** - Track progress toward journaling targets

### User Experience
- **Dark/Light Mode** - Seamless theme switching
- **Simple Mode** - Minimalist interface option
- **Responsive Design** - Works on desktop and mobile
- **Shimmer Loading** - Smooth loading states
- **Error Boundaries** - Graceful error handling

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation
- **Date-fns** for date handling
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Cloudinary** for image storage
- **Google Gemini AI** for AI features
- **bcryptjs** for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account
- Google AI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd saga-journal
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment Setup**

Backend `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_google_ai_api_key
```

Frontend `.env`:
```env
VITE_BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

4. **Start the application**
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory) 
npm run dev
```

The app will be available at `http://localhost:5173`

## Production Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Environment Variables for Production
- Set `VITE_BACKEND_URL` to your production API URL
- Set `NODE_ENV=production`
- Configure your hosting platform with the built `dist` folder

### Backend Deployment
- Set `NODE_ENV=production`
- Configure MongoDB connection for production
- Set up Cloudinary and Google AI API keys
- Deploy to your preferred platform (Heroku, Railway, etc.)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Entries
- `GET /api/entries` - Get user entries (with pagination, search, filters)
- `POST /api/entries` - Create new entry
- `GET /api/entries/:id` - Get specific entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

### Images
- `POST /api/images/upload` - Upload images
- `DELETE /api/images/delete` - Delete images

### AI Features
- `POST /api/ai/prompt` - Generate writing prompts
- `POST /api/ai/mood-prompt` - Generate mood-based prompts
- `POST /api/ai/summarize` - Analyze entry
- `POST /api/ai/period-summary` - Generate period summaries
- `POST /api/ai/chat` - AI chat with context

## Architecture

### Frontend Structure
```
src/
├── components/ui/          # Reusable UI components
├── pages/                  # Route components
├── contexts/              # React contexts (Auth, Chat, etc.)
├── hooks/                 # Custom React hooks
├── config/                # Configuration files
└── assets/                # Static assets
```

### Backend Structure
```
app/
├── controllers/           # Route handlers
├── middleware/           # Express middleware
├── models/               # MongoDB schemas
├── routes/               # API routes
├── services/             # Business logic
└── config/               # Configuration
```

## Key Features Implementation

### Image Management
- Cloudinary integration for storage
- Automatic cleanup on entry deletion
- Multiple image support per entry
- Alt text for accessibility

### AI Integration
- Google Gemini AI for natural language processing
- Context-aware responses using entry history
- Mood analysis and theme extraction
- Personalized writing prompts

### Data Security
- JWT-based authentication
- User-scoped data access
- Input sanitization
- Environment variable configuration

### Performance Optimizations
- Entry caching with 5-minute TTL
- Lazy loading for images
- Pagination for large datasets
- Shimmer loading states

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
