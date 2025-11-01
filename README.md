# LinkedInClone

This is a small LinkedIn-like clone project (frontend + backend) built as a learning project. It includes user authentication, posting, and image upload support via Cloudinary.

## Summary

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Image storage: Cloudinary (for profile pictures and post images)
- File handling: multer (uploads temporarily saved and sent to Cloudinary)
- Auth: JWT tokens

This README explains how to run the project, the tech stack used, and the main features implemented (including profile picture upload during signup).

---

## Project structure (high level)

- `backend/` - Express API, Mongoose models, Cloudinary config, upload handling
- `frontend/` - React app (Vite), components, pages, services

Key backend files you may want to inspect:
- `backend/server.js` - Express server entry
- `backend/routes/` - API routes (authRoutes, postRoutes)
- `backend/controllers/` - Route handlers (authController, postController)
- `backend/config/cloudinary.js` - Cloudinary configuration
- `backend/models/User.js` - User schema (contains `profilePic` field)

Key frontend files:
- `frontend/src/pages/Signup.jsx` - Signup form now supports profile picture upload
- `frontend/src/pages/Profile.jsx` - Shows large avatar (uses `profile.profilePic` when available)
- `frontend/src/pages/Feed.jsx` - Shows posts and the current user's avatar in sidebar and post composer
- `frontend/src/components/PostCard.jsx` - Shows poster's profile picture in feed if available
- `frontend/src/services/api.js` - Axios instance and API wrappers (signup uses multipart/form-data)

---

## Environment variables

Create a `.env` file in the `backend/` directory and set the following (example names):

```
MONGO_URI=<your-mongo-uri>
PORT=3000
JWT_SECRET=<a-strong-secret>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

Notes:
- Cloudinary credentials are required so that uploaded images are stored on Cloudinary and the returned secure URLs are saved on the user/post documents.

---

## How to run the project (local)

Open two terminals (one for backend, one for frontend).

Backend (zsh):

```bash
cd backend
npm install
# ensure .env is configured
npm run dev   # or `node server.js` / `nodemon server.js` depending on package.json scripts
```

Frontend (zsh):

```bash
cd frontend
npm install
npm run dev   # runs Vite dev server (default port 5173)
```

By default the frontend Axios base URL expects the backend at `http://localhost:3000/api` (see `frontend/src/services/api.js`). Adjust `backend` `PORT` or `API.baseURL` as needed.

---

## Tech stack

- Frontend
  - React + Vite
  - Tailwind-like utility classes used in JSX (project appears to use a utility-first CSS setup)
  - Axios for API requests

- Backend
  - Node.js + Express
  - MongoDB + Mongoose
  - Cloudinary for storing images
  - multer for handling multipart/form-data uploads
  - bcryptjs for password hashing
  - jsonwebtoken (JWT) for authentication

---

## Features added / implemented (highlights)

This project contains the core features expected of this LinkedIn-like clone. Important additions implemented during the recent work:

1. Profile picture upload during signup
   - The signup form on the frontend (`Signup.jsx`) now accepts a `profilePic` image file.
   - The frontend sends a `FormData` payload to the backend (Content-Type: multipart/form-data).
   - Backend accepts the uploaded file via `multer`, uploads it to Cloudinary, and stores the returned `secure_url` in the `User.profilePic` field.
   - The signup response includes the `profilePic` URL, and the frontend stores the user (and token) so the UI can show the picture immediately.

2. Show profile pictures across the UI
   - `Navbar.jsx` uses `user.profilePic` when available (fallback: first letter avatar).
   - `Profile.jsx` shows the large profile avatar using `profile.profilePic`.
   - `Feed.jsx` shows the user's avatar in the sidebar and composer using `user.profilePic`.
   - `PostCard.jsx` displays the post author's `user.profilePic` (populated by the backend) in the feed. If `profilePic` is not available, it falls back to the author initial.

3. Post image upload
   - Users can upload images when creating a post. The backend uploads the image to Cloudinary and the post stores the returned image URL.

4. API / Backend wiring
   - Backend post queries populate the `user` field selecting `name`, `profilePic`, and `headline`, so the frontend receives the author avatar with each post.
   - Authentication endpoints include `profilePic` in the returned user information on login/signup.

---

## Quick manual test checklist

1. Start backend and frontend as described above.
2. Open the app in the browser (frontend dev server URL shown by Vite, usually `http://localhost:5173`).
3. Go to Signup, fill in details, and select an image for profile picture. Submit.
4. After successful signup/login, confirm:
   - Navbar shows your uploaded avatar.
   - Profile page shows the large avatar.
   - If you create a post, the post card shows your avatar as author.

If any of the above shows a letter avatar instead of the uploaded image, double-check that:
- `.env` Cloudinary credentials are correct
- The backend logs show Cloudinary upload success and a `secure_url` saved to the created user
- The frontend `user` object stored in localStorage includes `profilePic` (open DevTools -> Application -> Local Storage)

---

## Troubleshooting & Notes

- Ensure the backend `uploads/` directory exists and is writable (multer uploads files there temporarily before Cloudinary upload).
- If you get CORS errors, verify `backend/server.js` enables CORS for the frontend origin.
- If images do not upload, check that `CLOUDINARY_*` env vars are correct and the account has available upload capacity.
- When testing in production, consider removing temporary local upload storage and uploading directly from the client to Cloudinary signed uploads (for improved scalability and security).

---

## Next steps / improvements (suggestions)

- Add profile edit flow to allow replacing profile picture (already wired to accept `PUT /auth/profile`, but you may want to support file upload there too).
- Optimize avatar sizes and caching headers for faster loads.
- Improve error handling and user feedback during image uploads (progress bars, retries).
- Add unit/integration tests for upload flows and controllers.

---

If you want, I can also:
- Add a minimal `.env.example` file to the repository
- Add a small troubleshooting script to verify Cloudinary and Mongo connectivity
- Add tests for the signup/upload flow

Enjoy building — tell me if you want the `.env.example` or to harden the upload flow further.
