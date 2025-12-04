# Groceries Web - React E-commerce Application

A modern, mobile-first React e-commerce application built with Tailwind CSS and shadcn UI.

## Features

- 🛍️ Product browsing and search
- 🛒 Shopping cart functionality
- 📦 Order management
- ❤️ Favorites/Wishlist
- 👤 User authentication (Email/Password & OTP)
- 📍 Address management
- 💳 Payment integration
- 🎁 Redeem points system
- 📱 Mobile-first responsive design

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **Tailwind CSS** for styling
- **shadcn UI** for component library
- **Zustand** for state management
- **Axios** for API calls
- **React Hook Form** with Zod for form validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://groceries.itfuturz.in/api
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
groceries-web/
├── src/
│   ├── components/       # Reusable components
│   │   ├── ui/           # shadcn UI components
│   │   └── layout/       # Layout components
│   ├── constants/        # Constants and configuration
│   ├── layouts/          # Page layouts
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   ├── services/          # API services
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json
```

## API Integration

The application integrates with the backend API. All API endpoints are defined in `src/constants/api.constants.ts` and the API service is in `src/services/api.service.ts`.

## Mobile-First Design

This application is designed with a mobile-first approach, ensuring optimal experience on mobile devices while maintaining full functionality on desktop.

## License

MIT

