import express from 'express';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

router.get('/folders', async (req, res) => {
  const folderPath = req.query.path || 'bsa-604/events';

  try {
    const result = await cloudinary.api.sub_folders(folderPath);
    const folders = Array.isArray(result.folders)
      ? result.folders.map(folder => ({
          name: folder.name,
          path: folder.path
        }))
      : [];

    res.json({ folders });
  } catch (error) {
    console.error('Cloudinary folders error:', error);
    res.status(500).json({ error: 'Failed to fetch Cloudinary folders' });
  }
});

export default router;
