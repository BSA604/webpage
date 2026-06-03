import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../db.js';

const router = express.Router();

// Public route: get Cloudinary folders as events
router.get('/', async (req, res) => {
  const folderPath = req.query.path || 'bsa-604/events';

  try {
    const result = await cloudinary.api.sub_folders(folderPath);
    const folders = Array.isArray(result.folders)
      ? result.folders.map(folder => ({
          id: folder.name,
          name: folder.name,
          path: folder.path
        }))
      : [];

    res.json(folders);
  } catch (error) {
    console.error('Failed to fetch Cloudinary event folders:', error);
    res.status(500).json({ error: 'Failed to fetch event folders' });
  }
});

// Local event management for admin
router.get('/local', (req, res) => {
  try {
    const events = getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch local events' });
  }
});

router.get('/local/:id', (req, res) => {
  try {
    const event = getEventById(parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.post('/local', verifyToken, (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Event name required' });
  }

  try {
    const event = createEvent(name, description || '');
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/local/:id', verifyToken, (req, res) => {
  const { name, description } = req.body;

  try {
    const event = updateEvent(parseInt(req.params.id), { name, description });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/local/:id', verifyToken, (req, res) => {
  try {
    deleteEvent(parseInt(req.params.id));
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
