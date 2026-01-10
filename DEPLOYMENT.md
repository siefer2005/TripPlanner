# Deploying the Backend to Render

This guide outlines the steps to deploy the API backend of the TravelPlanner application to **Render**, a unified cloud to build, run, and scale your apps.

## 1. Prerequisites

- The project should be pushed to a GitHub repository.
- You should have an account on [Render](https://render.com/).

## 2. Configuration Check

We have updated `api/package.json` to be production-ready:
```json
"scripts": {
  "start": "node dist/index.js",
  "build": "tsc"
}
```
This ensures Render compiles your TypeScript to JavaScript (`npm run build`) and then runs the efficient JavaScript code (`npm start`).

## 3. Create a Web Service on Render

1.  **Dashboard**: logic into your Render Dashboard and click **New +** and select **Web Service**.
2.  **Source Code**: Select **Build and deploy from a Git repository** and click **Next**.
3.  **Connect Repository**: Find your `TripPlanner` repository in the list and click **Connect**.
4.  **Configuration**:
    -   **Name**: `travelplanner-api` (or any name you like).
    -   **Region**: Select a region close to your users.
    -   **Branch**: Select `main`.
    -   **Root Directory**: Enter **`api`** (CRITICAL: Your backend is in this folder).
    -   **Runtime**: Select **Node**.
    -   **Build Command**: Enter **`npm install && npm run build`**.
    -   **Start Command**: Enter **`npm start`**.
    -   **Instance Type**: Select **Free**.

## 4. Environment Variables

You must add your environment variables in the **Environment** tab on Render.
Use the values from your `api/.env` file.

| Variable Name           | Value (Example/Description)                                 |
| ----------------------- | ----------------------------------------------------------- |
| `JWT_SECRET`            | *Generate a long random string*                             |
| `OPENROUTER_API_KEY`    | `sk-or-v1-...`                                              |
| `LIVEKIT_API_KEY`       | `API...`                                                    |
| `LIVEKIT_API_SECRET`    | `lZ...`                                                     |
| `GOOGLE_MAPS_API_KEY`   | `AIza...`                                                   |
| `FIREBASE_API_KEY`      | `AIza...`                                                   |
| `FIREBASE_AUTH_DOMAIN`  | `...firebaseapp.com`                                        |
| `FIREBASE_PROJECT_ID`   | `...`                                                       |
| `FIREBASE_STORAGE_BUCKET`| `...firebasestorage.app`                                   |
| `FIREBASE_MESSAGING_SENDER_ID`| `...`                                                 |
| `FIREBASE_APP_ID`       | `1:...`                                                     |
| `FIREBASE_MEASUREMENT_ID`| `G-...`                                                    |
| `GOOGLE_WEB_CLIENT_ID`  | `...apps.googleusercontent.com`                             |

**Important**: Do not use quotes (`""`) for values in the Render dashboard.

## 5. Deploy & Verify

1.  Click **Create Web Service**.
2.  Render will verify the build and start the server.
3.  Watch the logs. Success looks like:
    ```
    > api@1.0.0 start
    > node dist/index.js
    Server running on port 10000
    ```
4.  Copy your new backend URL (e.g., `https://travelplanner-api.onrender.com`).

## 6. Update Frontend

After deployment, replace your local API URL in the app with the new Render URL.
