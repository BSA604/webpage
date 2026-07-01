// Configure API endpoint (match admin.js behavior)
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://bsa-604-gallery-api.onrender.com/api';

const eventFilter = document.getElementById('eventFilter');
const galleryContainer = document.getElementById('galleryContainer');

const state = {
  folders: [],
  selectedFolder: ''
};

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadFolders();
});

function setupEventListeners() {
  eventFilter.addEventListener('change', async (e) => {
    const folder = e.target.value;
    state.selectedFolder = folder;
    if (folder) await loadPhotos(folder);
  });
}

async function loadFolders() {
  galleryContainer.innerHTML = '<div class="loading">Loading events...</div>';
  try {
    const res = await fetch(`${API_BASE}/gallery/folders`);
    if (!res.ok) throw new Error(`Failed to load folders: ${res.status}`);
    const folders = await res.json();
    state.folders = Array.isArray(folders) ? folders : [];

    // Populate select
    eventFilter.innerHTML = '';
    if (state.folders.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No events available';
      eventFilter.appendChild(opt);
      galleryContainer.innerHTML = '<div class="no-content">No photos to display</div>';
      return;
    }

    state.folders.forEach((f, idx) => {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      eventFilter.appendChild(opt);
      if (idx === 0) state.selectedFolder = f;
    });

    // Load first folder by default
    if (state.selectedFolder) await loadPhotos(state.selectedFolder);
  } catch (error) {
    console.error('Error loading folders:', error);
    galleryContainer.innerHTML = '<div class="error">Unable to load gallery folders. Please try again later.</div>';
  }
}

async function loadPhotos(folder) {
  galleryContainer.innerHTML = '<div class="loading">Loading photos...</div>';
  try {
    const res = await fetch(`${API_BASE}/gallery/photos?folder=${encodeURIComponent(folder)}`);
    if (!res.ok) throw new Error(`Failed to load photos: ${res.status}`);
    const photos = await res.json();

    renderPhotos(photos || []);
  } catch (error) {
    console.error('Error loading photos:', error);
    galleryContainer.innerHTML = '<div class="error">Unable to load photos for this event.</div>';
  }
}

function renderPhotos(photos) {
  galleryContainer.innerHTML = '';
  if (!photos || photos.length === 0) {
    galleryContainer.innerHTML = '<div class="no-content">No photos found for this event.</div>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'gallery-grid-inner';

  photos.forEach(photo => {
    const card = createPhotoCard(photo);
    grid.appendChild(card);
  });

  galleryContainer.appendChild(grid);
}

function createPhotoCard(photo) {
  const wrap = document.createElement('div');
  wrap.className = 'photo-card';

  const img = document.createElement('img');
  // Prefer cloudinaryUrl, fallback to url
  img.src = photo.cloudinaryUrl || photo.url || photo.secure_url || '';
  img.alt = photo.title || photo.public_id || 'Event photo';
  img.loading = 'lazy';
  wrap.appendChild(img);

  // Optional caption
  if (photo.uploader || photo.createdAt) {
    const meta = document.createElement('div');
    meta.className = 'photo-meta';
    meta.textContent = photo.uploader ? `Uploaded by: ${photo.uploader}` : new Date(photo.createdAt || Date.now()).toLocaleDateString();
    wrap.appendChild(meta);
  }

  // Click to open full size in new tab
  wrap.addEventListener('click', () => {
    const full = photo.cloudinaryUrl || photo.url || photo.secure_url || img.src;
    if (full) window.open(full, '_blank');
  });

  return wrap;
}
