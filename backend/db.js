import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data.json');

// Initialize database with default structure
const DEFAULT_DB = {
  events: [],
  photos: [],
  lastPhotoId: 0,
  lastEventId: 0
};

export function initializeDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    console.log('Database initialized at', DB_PATH);
  }
}

export function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return DEFAULT_DB;
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
}

// Helper functions
export function getAllEvents() {
  const db = readDB();
  return db.events;
}

export function getEventById(id) {
  const db = readDB();
  return db.events.find(e => e.id === id);
}

export function createEvent(name, description = '') {
  const db = readDB();
  const newEvent = {
    id: ++db.lastEventId,
    name,
    description,
    createdAt: new Date().toISOString()
  };
  db.events.push(newEvent);
  writeDB(db);
  return newEvent;
}

export function updateEvent(id, updates) {
  const db = readDB();
  const event = db.events.find(e => e.id === id);
  if (!event) return null;
  Object.assign(event, updates, { updatedAt: new Date().toISOString() });
  writeDB(db);
  return event;
}

export function deleteEvent(id) {
  const db = readDB();
  db.events = db.events.filter(e => e.id !== id);
  // Also remove photos associated with this event
  db.photos = db.photos.filter(p => p.eventId !== id);
  writeDB(db);
  return true;
}

export function getAllPhotos(filters = {}) {
  const db = readDB();
  let photos = db.photos;
  
  if (filters.eventId) {
    photos = photos.filter(p => p.eventId === filters.eventId);
  }
  if (filters.status) {
    photos = photos.filter(p => p.status === filters.status);
  }
  
  return photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function createPhoto(eventId, cloudinaryData, uploader = 'anonymous') {
  const db = readDB();
  const newPhoto = {
    id: ++db.lastPhotoId,
    eventId,
    cloudinaryPublicId: cloudinaryData.public_id,
    cloudinaryUrl: cloudinaryData.secure_url,
    status: 'pending', // pending, approved, rejected
    uploader,
    createdAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null
  };
  db.photos.push(newPhoto);
  writeDB(db);
  return newPhoto;
}

export function updatePhotoStatus(id, status) {
  const db = readDB();
  const photo = db.photos.find(p => p.id === id);
  if (!photo) return null;
  
  photo.status = status;
  if (status === 'approved') {
    photo.approvedAt = new Date().toISOString();
  } else if (status === 'rejected') {
    photo.rejectedAt = new Date().toISOString();
  }
  
  writeDB(db);
  return photo;
}

export function deletePhoto(id) {
  const db = readDB();
  db.photos = db.photos.filter(p => p.id !== id);
  writeDB(db);
  return true;
}
