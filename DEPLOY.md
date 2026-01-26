# Deployment Guide: MicroItinerary

This guide helps you deploy the MicroItinerary application for free using **Render** (Backend) and **Netlify** (Frontend).

## Prerequisites
1.  **GitHub Account**: You need your code pushed to a GitHub repository.
2.  **Deployment Accounts**: Sign up for free accounts on [Render.com](https://render.com) and [Netlify](https://www.netlify.com).

---

## Part 1: Backend Deployment (Render)

Render will host the Spring Boot API and the PostgreSQL database.

### 1. Create Database
1.  Go to Render Dashboard -> **New +** -> **PostgreSQL**.
2.  Name: `microitinerary-db`.
3.  Region: Pick one close to you (e.g., Singapore, Frankfurt).
4.  Plan: **Free**.
5.  Click **Create Database**.
6.  **Important**: Copy the `Internal DB URL` and `External DB URL`. You will need them.

### 2. Deploy Spring Boot API
1.  Go to Render Dashboard -> **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: `microitinerary-api`.
4.  **Region**: Same as your database.
5.  **Runtime**: **Docker** (Render will automatically detect the `Dockerfile` in `backend/`).
6.  **Root Directory**: `backend` (Important!).
7.  **Environment Variables**: Add the following:
    *   `SPRING_DATASOURCE_URL`: Use the **Internal DB URL** from step 1 (starts with `postgres://...`).
        *   *Note: If the internal URL ends with `.render.internal`, append `?sslmode=require` if you have connection issues, but usually it works as is.*
    *   `SPRING_DATASOURCE_USERNAME`: The username from your DB details.
    *   `SPRING_DATASOURCE_PASSWORD`: The password from your DB details.
    *   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
    *   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
    *   `APP_CORS_ALLOWED_ORIGINS`: `https://YOUR-NETLIFY-SITE-NAME.netlify.app` (You will update this *after* deploying the frontend, for now you can put `*`).
8.  **Plan**: **Free**.
9.  Click **Create Web Service**.

Wait for the build to finish. Once "Live", copy your backend URL (e.g., `https://microitinerary-api.onrender.com`).

---

## Part 2: Frontend Deployment (Netlify)

Netlify will host the React application.

### 1. Configure for Production
Netlify needs to know where your backend is.
1.  In your local code, ensure the `web/public/_redirects` file exists (I have already created this for you).

### 2. Deploy to Netlify
1.  Go to Netlify Dashboard -> **Add new site** -> **Import from Git**.
2.  Connect your GitHub repository.
3.  **Base directory**: `web`
4.  **Build command**: `npm run build`
5.  **Publish directory**: `dist`
6.  **Environment Variables**:
    *   Click "Show advanced" -> "New Variable".
    *   Key: `VITE_API_URL`
    *   Value: Your **Render Backend URL** (e.g., `https://microitinerary-api.onrender.com`).
    *   *Note: Do NOT include a trailing slash.*
7.  Click **Deploy site**.

### 3. Final Connection
1.  Once Netlify deploys, you will get a URL (e.g., `https://musical-starlight-123.netlify.app`).
2.  Go back to **Render Dashboard** -> **microitinerary-api** -> **Environment**.
3.  Update (or add) `APP_CORS_ALLOWED_ORIGINS` to match your Netlify URL: `https://musical-starlight-123.netlify.app`.
4.  Reference the Google Cloud Console and add your Netlify URL to the "Authorized Javascript Origins" and "Authorized Redirect URIs".

---

## Success!
Your app should now be live!
- **Frontend**: https://your-site.netlify.app
- **Backend**: https://your-backend.onrender.com
- **Database**: hosted on Render
