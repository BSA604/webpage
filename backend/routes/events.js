import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../db.js';

const router = express.Router();

// Public route: get all events
router.get('/', (req, res) => {
  try {
    const events = getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Public route: get single event
router.get('/:id', (req, res) => {
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

// Admin: create event
router.post('/', verifyToken, (req, res) => {
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

// Admin: update event
router.put('/:id', verifyToken, (req, res) => {
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

// Admin: delete event
router.delete('/:id', verifyToken, (req, res) => {
  try {
    deleteEvent(parseInt(req.params.id));
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
