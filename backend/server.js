const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Warning: CLOUDINARY_* env vars are not fully configured. Set them in .env before using the API.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// GET /api/gallery/folders
// Returns a deduplicated, sorted list of folders that contain images.
app.get('/api/gallery/folders', async (req, res) => {
  try {
    const max = parseInt(process.env.MAX_SEARCH_RESULTS || req.query.max_results || '500', 10);
    const result = await cloudinary.api.root_folders().then(callback);

    console.log('Cloudinary folders result:', result);

    const folders = new Set();
    (result.resources || []).forEach(r => {
      if (r.folder) folders.add(r.folder);
    });

    res.json(Array.from(folders).sort());
  } catch (err) {
    console.error('Error listing folders:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gallery/photos?folder=FolderName
// Returns photos within the specified folder.
app.get('/api/gallery/photos', async (req, res) => {
  const folder = req.query.folder;
  if (!folder) return res.status(400).json({ error: 'Missing folder query parameter' });

  try {
    const max = parseInt(process.env.MAX_SEARCH_RESULTS || req.query.max_results || '500', 10);
    const expression = `folder:${folder}/* AND resource_type:image`;
    const result = await cloudinary.search
      .expression(expression)
      .max_results(max)
      .execute();

    const photos = (result.resources || []).map(r => ({
      public_id: r.public_id,
      format: r.format,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      createdAt: r.created_at,
      cloudinaryUrl: r.secure_url || r.url,
      folder: r.folder,
    }));

    res.json(photos);
  } catch (err) {
    console.error('Error listing photos for folder', folder, err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
