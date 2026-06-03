# BSA Troop 604 Photo Gallery Backend

Backend API for photo gallery with Cloudinary upload and admin moderation.

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- Cloudinary account (free tier available)
- Git

### Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   - `PORT` - Default: 3000
   - `JWT_SECRET` - Generate a random string, e.g., `openssl rand -hex 32`
   - `ADMIN_USERNAME` - Default: admin
   - `ADMIN_PASSWORD` - Change this!
   - `CLOUDINARY_CLOUD_NAME` - From Cloudinary dashboard
   - `CLOUDINARY_API_KEY` - From Cloudinary dashboard
   - `CLOUDINARY_API_SECRET` - From Cloudinary dashboard
   - `CORS_ORIGIN` - Frontend URL (http://localhost:8000 for local)

4. **Get Cloudinary Credentials:**
   - Sign up at https://cloudinary.com (free tier)
   - Go to Dashboard → Settings
   - Copy Cloud Name, API Key, and API Secret

5. **Run the server:**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

6. **Test it:**
   - Health check: `http://localhost:3000/health`
   - Admin login: `POST http://localhost:3000/api/auth/login`
     ```json
     { "username": "admin", "password": "changeme" }
     ```

## Project Structure

```
backend/
├── server.js              # Express app and middleware
├── db.js                  # Database operations (JSON file storage)
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .env                   # Local environment (gitignored)
├── data.json              # Database file (gitignored)
├── middleware/
│   └── auth.js            # JWT verification
├── routes/
│   ├── auth.js            # Login/logout endpoints
│   ├── events.js          # Event CRUD endpoints
│   └── photos.js          # Photo upload/moderation endpoints
└── config/
    └── cloudinary.js      # Cloudinary configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
  - Body: `{ username, password }`
  - Returns: `{ token, expiresIn }`

### Events (Public)
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get single event

### Events (Admin only - requires JWT)
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event (also deletes associated photos)

### Photos (Public)
- `POST /api/photos/upload` - Upload photo (stores as pending)
  - Form data: `{ photo, eventId, uploader }`
- `GET /api/photos?eventId=:id&status=approved` - Get approved photos

### Photos (Admin only - requires JWT)
- `GET /api/photos/admin/all` - Get all photos (including pending/rejected)
- `PATCH /api/photos/:id/approve` - Approve photo
- `PATCH /api/photos/:id/reject` - Reject photo
- `DELETE /api/photos/:id` - Delete photo

## Deployment to Render.com

### Step 1: Prepare Backend

1. Create `.env.production` with production values (or use Render env vars)
2. Commit all code to GitHub

### Step 2: Deploy on Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select your GitHub repo
5. Configure:
   - **Name:** bsa-604-gallery-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free tier (includes sleep after 15 min inactivity)

6. Add environment variables:
   - Go to Environment
   - Add all variables from `.env` (JWT_SECRET, Cloudinary keys, etc.)

7. Click "Create Web Service"
8. Render auto-deploys and gives you a URL like `https://bsa-604-gallery-api.onrender.com`

### Step 3: Update Frontend CORS

Update `js/gallery.js` and `js/admin.js` to use the Render backend URL:

```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://bsa-604-gallery-api.onrender.com/api';
```

### Step 4: Update GitHub Pages CORS

If frontend is on GitHub Pages, add the Render URL to CORS_ORIGIN env var:
```
CORS_ORIGIN=https://bsa-604.org,https://your-github-pages-url.github.io
```

## Database

The backend uses a simple JSON file (`data.json`) for storage:

```json
{
  "events": [
    { "id": 1, "name": "Spring Camping", "description": "...", "createdAt": "..." }
  ],
  "photos": [
    {
      "id": 1,
      "eventId": 1,
      "cloudinaryPublicId": "bsa-604/events/1/...",
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "status": "pending|approved|rejected",
      "uploader": "John Doe",
      "createdAt": "...",
      "approvedAt": null,
      "rejectedAt": null
    }
  ]
}
```

## Troubleshooting

### CORS Errors
- Make sure `CORS_ORIGIN` includes the frontend URL
- No wildcard `*` allowed in production for security

### Photos Not Uploading
- Check Cloudinary credentials are correct
- Verify file size (Cloudinary free tier has limits)
- Check browser console for error details

### Admin Login Fails
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- Check JWT_SECRET is set
- Ensure token is being sent in Authorization header

### Render Sleep/Wake Issues
- First request after sleep will take ~30 seconds
- This is normal on free tier
- Use a monitoring service to keep it awake during events

## Next Steps

1. Test locally with `npm start`
2. Create `.env` file with your credentials
3. Deploy to Render.com
4. Connect frontend to your Render API endpoint
5. Test the full flow: upload → pending → approve → display

## Security Notes

- **Production**: Use environment variables for all secrets
- **Admin credentials**: Currently simple username/password. Consider OAuth for multi-admin access
- **Database**: Currently JSON file. Migrate to MongoDB/Firebase for scalability
- **Photo uploads**: Add file size limits and image validation
- **CORS**: Be specific with origins, never use wildcard in production
