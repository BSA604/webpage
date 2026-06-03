import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { verifyToken } from '../middleware/auth.js';
import {
  getAllPhotos,
  createPhoto,
  updatePhotoStatus,
  deletePhoto
} from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public: upload photo (unmoderated)
router.post('/upload', upload.single('photo'), async (req, res) => {
  const { eventId, uploader } = req.body;

  if (!eventId || !req.file) {
    return res.status(400).json({ error: 'Event ID and photo file required' });
  }

  try {
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bsa-604/events/${eventId}`,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Store metadata locally
    const photo = createPhoto(
      eventId,
      result,
      uploader || 'anonymous'
    );

    res.status(201).json({
      message: 'Photo uploaded successfully and pending moderation',
      photo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Public: get photos (filters by status, eventId)
router.get('/', (req, res) => {
  try {
    const { eventId, status = 'approved' } = req.query;
    const filters = { status };
    if (eventId) filters.eventId = eventId;

    const photos = getAllPhotos(filters);
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Admin: get all photos (including pending)
router.get('/admin/all', verifyToken, (req, res) => {
  try {
    const photos = getAllPhotos();
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Admin: approve photo
router.patch('/:id/approve', verifyToken, (req, res) => {
  try {
    const photo = updatePhotoStatus(parseInt(req.params.id), 'approved');
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json({ message: 'Photo approved', photo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve photo' });
  }
});

// Admin: reject photo
router.patch('/:id/reject', verifyToken, (req, res) => {
  try {
    const photo = updatePhotoStatus(parseInt(req.params.id), 'rejected');
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json({ message: 'Photo rejected', photo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject photo' });
  }
});

// Admin: delete photo
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    deletePhoto(parseInt(req.params.id));
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;
