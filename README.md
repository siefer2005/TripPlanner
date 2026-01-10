# TravelPlanner

TravelPlanner is a cutting-edge mobile application designed to simplify and enhance your travel experiences. Built with **React Native CLI**, it leverages the power of **Artificial Intelligence** to generate personalized trip itineraries, integrates **Google Maps** for seamless navigation, and offers secure authentication via **Google OAuth 2.0**.

## 🚀 Features

- **AI-Powered Itineraries**: Generate detailed day-by-day trip plans using OpenAI.
- **Smart Destination Search**: Find places easily with Google Places Autocomplete and Geocoding API.
- **Interactive Maps**: Visualize your trip with integrated Google Maps.
- **Secure Authentication**: seamless sign-in experience using Google OAuth 2.0.
- **Real-Time Features**: Integrated with LiveKit for real-time capabilities.
- **Modern UI/UX**: A smooth, responsive interface featuring Lottie animations and linear gradients.
- **Trip Management**: Create, store, and manage your travel history.

## 🛠 Tech Stack

- **Framework**: React Native CLI
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **AI Integration**: OpenAI API
- **Maps & Geolocation**: React Native Maps, Google Places Autocomplete
- **Authentication**: React Native Google Sign-In
- **Animations**: Lottie React Native

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) 
- [React Native CLI environment setup](https://reactnative.dev/docs/environment-setup) (Android Studio / Xcode)
- A Google Cloud Project with the following APIs enabled:
  - Maps SDK for Android/iOS
  - Places API
  - Geocoding API
  - Google Identity (OAuth 2.0)
- An OpenAI API Key

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/siefer2005/TripPlanner.git
   cd TripPlanner
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   
   Ensure you have your API keys ready. Check for configuration files like `chatConfig.ts` or `.env` (if applicable) to insert your keys:
   - `OPENAI_API_KEY`
   - Google Maps API Keys
   - Google OAuth Client IDs

4. **Start the Backend API:**
   
   The project includes a local backend server.

   ```bash
   cd api
   npm install
   npm start
   ```

## 📱 Running the App

Return to the root directory and run the application.

### Android

```bash
# This command runs the backend and the android app concurrently
npm run android
```

Or manually:

```bash
npx react-native run-android
```

### iOS

```bash
npm run ios
```

## 📂 Project Structure

```
TravelPlanner/
├── api/                 # Backend server code
├── android/             # Android native code
├── ios/                 # iOS native code
├── navigation/          # Navigation configuration
├── screens/             # Application screens (Login, Home, AI Screen, etc.)
├── components/          # Reusable UI components
├── assets/              # Images, fonts, and animations
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
