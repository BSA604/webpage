// Configure API endpoint based on environment
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://bsa-604-gallery-api.onrender.com/api'; // Same origin in production

// ============== DOM Elements ==============
const uploadForm = document.getElementById('uploadForm');
const eventSelect = document.getElementById('eventSelect');
const eventFilter = document.getElementById('eventFilter');
const photoInput = document.getElementById('photoInput');
const uploaderName = document.getElementById('uploaderName');
const uploadStatus = document.getElementById('uploadStatus');
const galleryContainer = document.getElementById('galleryContainer');

// ============== Initialize ==============
document.addEventListener('DOMContentLoaded', async () => {
  await loadEvents();
  await loadPhotos();
  setupEventListeners();
});

// ============== Event Listeners ==============
function setupEventListeners() {
  uploadForm.addEventListener('submit', handleUpload);
  eventFilter.addEventListener('change', loadPhotos);
}

// ============== Load Events ==============
async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE}/events`);
    const folders = await response.json();

    // Populate upload dropdown
    eventSelect.innerHTML = '<option value="">-- Select Event --</option>';
    folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.name;
      option.textContent = folder.name;
      eventSelect.appendChild(option);
    });

    // Populate filter dropdown
    eventFilter.innerHTML = '<option value="">All Events</option>';
    folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.name;
      option.textContent = folder.name;
      eventFilter.appendChild(option);
    });

    if (folders.length === 0) {
      eventSelect.innerHTML = '<option value="">No events found</option>';
      eventFilter.innerHTML = '<option value="">All Events</option>';
    }
  } catch (error) {
    console.error('Error loading events:', error);
    showStatus('uploadStatus', 'Error loading events', 'error');
  }
}

// ============== Load Photos ==============
async function loadPhotos() {
  try {
    const eventId = eventFilter.value;
    const url = new URL(`${API_BASE}/photos`);
    url.searchParams.set('status', 'approved');
    if (eventId) url.searchParams.set('eventId', eventId);

    const response = await fetch(url);
    const photos = await response.json();

    galleryContainer.innerHTML = '';

    if (photos.length === 0) {
      galleryContainer.innerHTML = '<div class="no-photos">No photos yet. Be the first to upload!</div>';
      return;
    }

    photos.forEach(photo => {
      const photoCard = createPhotoCard(photo);
      galleryContainer.appendChild(photoCard);
    });
  } catch (error) {
    console.error('Error loading photos:', error);
    galleryContainer.innerHTML = '<div class="error">Error loading photos</div>';
  }
}

// ============== Create Photo Card ==============
function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.innerHTML = `
    <img src="${photo.cloudinaryUrl}" alt="Gallery photo" loading="lazy" />
    <div class="photo-info">
      <small>${new Date(photo.createdAt).toLocaleDateString()}</small>
      ${photo.uploader !== 'anonymous' ? `<small>Uploaded by: ${photo.uploader}</small>` : ''}
    </div>
  `;
  return card;
}

// ============== Handle Upload ==============
async function handleUpload(e) {
  e.preventDefault();

  const eventId = eventSelect.value;
  const file = photoInput.files[0];
  const name = uploaderName.value || 'anonymous';

  if (!eventId || !file) {
    showStatus('uploadStatus', 'Please select an event and choose a photo', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('eventId', eventId);
  formData.append('uploader', name);

  try {
    showStatus('uploadStatus', 'Uploading...', 'loading');

    const response = await fetch(`${API_BASE}/photos/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    showStatus('uploadStatus', 'Photo uploaded! Pending admin approval.', 'success');
    uploadForm.reset();
    setTimeout(() => {
      loadPhotos(); // Refresh gallery
    }, 1000);
  } catch (error) {
    console.error('Upload error:', error);
    showStatus('uploadStatus', 'Failed to upload photo. Please try again.', 'error');
  }
}

// ============== Utility Functions ==============
function showStatus(elementId, message, type = 'info') {
  const element = document.getElementById(elementId);
  element.className = `status-message ${type}`;
  element.textContent = message;
  if (type === 'success') {
    setTimeout(() => {
      element.textContent = '';
    }, 5000);
  }
}
