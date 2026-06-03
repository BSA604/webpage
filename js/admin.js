// Configure API endpoint
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://bsa-604-gallery-api.onrender.com/api';

let token = localStorage.getItem('adminToken');

// ============== DOM Elements ==============
const loginContainer = document.getElementById('loginContainer');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const adminUsername = document.getElementById('adminUsername');
const loginStatus = document.getElementById('loginStatus');

// ============== Initialize ==============
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  if (token) {
    showDashboard();
    loadDashboardData();
  } else {
    showLogin();
  }
});

// ============== Event Listeners ==============
function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);

  // Tab navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', switchTab);
  });

  // Event management
  document.getElementById('createEventForm').addEventListener('submit', handleCreateEvent);

  // Moderation actions
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('approve-btn')) {
      approvePhoto(e.target.dataset.photoId);
    }
    if (e.target.classList.contains('reject-btn')) {
      rejectPhoto(e.target.dataset.photoId);
    }
    if (e.target.classList.contains('delete-btn')) {
      deletePhoto(e.target.dataset.photoId);
    }
    if (e.target.classList.contains('delete-event-btn')) {
      deleteEvent(e.target.dataset.eventId);
    }
  });
}

// ============== Authentication ==============
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    showLoginStatus('Logging in...', 'loading');

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    token = data.token;
    localStorage.setItem('adminToken', token);

    showLoginStatus('Login successful!', 'success');
    setTimeout(() => {
      showDashboard();
      loadDashboardData();
    }, 500);
  } catch (error) {
    console.error('Login error:', error);
    showLoginStatus('Invalid username or password', 'error');
  }
}

function handleLogout() {
  localStorage.removeItem('adminToken');
  token = null;
  loginForm.reset();
  showLogin();
}

function showLogin() {
  loginContainer.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
}

function showDashboard() {
  loginContainer.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
  adminUsername.textContent = `Logged in as: Admin`;
}

// ============== Load Dashboard Data ==============
async function loadDashboardData() {
  await loadPendingPhotos();
  await loadApprovedPhotos();
  await loadEvents();
}

// ============== Photo Management ==============
async function loadPendingPhotos() {
  try {
    const response = await fetch(`${API_BASE}/photos/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const photos = await response.json();
    const pending = photos.filter(p => p.status === 'pending');

    const container = document.getElementById('moderationQueue');
    container.innerHTML = '';

    if (pending.length === 0) {
      container.innerHTML = '<div class="no-content">No pending photos</div>';
      return;
    }

    pending.forEach(photo => {
      const card = createModerationCard(photo);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading pending photos:', error);
  }
}

async function loadApprovedPhotos() {
  try {
    const response = await fetch(`${API_BASE}/photos?status=approved`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const photos = await response.json();
    const container = document.getElementById('approvedPhotos');
    container.innerHTML = '';

    if (photos.length === 0) {
      container.innerHTML = '<div class="no-content">No approved photos yet</div>';
      return;
    }

    photos.forEach(photo => {
      const card = createPhotoPreviewCard(photo);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading approved photos:', error);
  }
}

function createModerationCard(photo) {
  const card = document.createElement('div');
  card.className = 'moderation-card';
  card.innerHTML = `
    <img src="${photo.cloudinaryUrl}" alt="Photo for moderation" />
    <div class="card-info">
      <small>Uploaded by: ${photo.uploader}</small>
      <small>${new Date(photo.createdAt).toLocaleString()}</small>
    </div>
    <div class="card-actions">
      <button class="btn btn-success approve-btn" data-photo-id="${photo.id}">✓ Approve</button>
      <button class="btn btn-danger reject-btn" data-photo-id="${photo.id}">✗ Reject</button>
    </div>
  `;
  return card;
}

function createPhotoPreviewCard(photo) {
  const card = document.createElement('div');
  card.className = 'moderation-card';
  card.innerHTML = `
    <img src="${photo.cloudinaryUrl}" alt="Approved photo" />
    <div class="card-info">
      <small>Uploaded by: ${photo.uploader}</small>
      <small>${new Date(photo.createdAt).toLocaleString()}</small>
    </div>
    <div class="card-actions">
      <button class="btn btn-danger delete-btn" data-photo-id="${photo.id}">🗑 Delete</button>
    </div>
  `;
  return card;
}

async function approvePhoto(photoId) {
  try {
    const response = await fetch(`${API_BASE}/photos/${photoId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      showStatus('Photo approved!', 'success');
      loadPendingPhotos();
      loadApprovedPhotos();
    }
  } catch (error) {
    console.error('Error approving photo:', error);
    showStatus('Error approving photo', 'error');
  }
}

async function rejectPhoto(photoId) {
  try {
    const response = await fetch(`${API_BASE}/photos/${photoId}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      showStatus('Photo rejected', 'success');
      loadPendingPhotos();
    }
  } catch (error) {
    console.error('Error rejecting photo:', error);
    showStatus('Error rejecting photo', 'error');
  }
}

async function deletePhoto(photoId) {
  if (!confirm('Are you sure you want to delete this photo?')) return;

  try {
    const response = await fetch(`${API_BASE}/photos/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      showStatus('Photo deleted', 'success');
      loadPendingPhotos();
      loadApprovedPhotos();
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    showStatus('Error deleting photo', 'error');
  }
}

// ============== Event Management ==============
async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const events = await response.json();
    const list = document.getElementById('eventsList');
    list.innerHTML = '';

    if (events.length === 0) {
      list.innerHTML = '<li class="no-content">No events yet. Create one below!</li>';
      return;
    }

    events.forEach(event => {
      const item = document.createElement('li');
      item.className = 'event-item';
      item.innerHTML = `
        <div class="event-details">
          <strong>${event.name}</strong>
          <p>${event.description || 'No description'}</p>
          <small>${new Date(event.createdAt).toLocaleDateString()}</small>
        </div>
        <button class="btn btn-danger delete-event-btn" data-event-id="${event.id}">Delete</button>
      `;
      list.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

async function handleCreateEvent(e) {
  e.preventDefault();

  const name = document.getElementById('eventName').value;
  const description = document.getElementById('eventDescription').value;

  try {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });

    if (response.ok) {
      showStatus('Event created!', 'success');
      document.getElementById('createEventForm').reset();
      loadEvents();
    }
  } catch (error) {
    console.error('Error creating event:', error);
    showStatus('Error creating event', 'error');
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Delete this event? Associated photos will also be deleted.')) return;

  try {
    const response = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      showStatus('Event deleted', 'success');
      loadEvents();
      loadPendingPhotos();
      loadApprovedPhotos();
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    showStatus('Error deleting event', 'error');
  }
}

// ============== Tab Navigation ==============
function switchTab(e) {
  const tabName = e.target.dataset.tab;

  // Remove active class from all buttons and tabs
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  // Add active class to clicked button and corresponding tab
  e.target.classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ============== Utility Functions ==============
function showStatus(message, type = 'info') {
  const status = document.createElement('div');
  status.className = `floating-status ${type}`;
  status.textContent = message;
  document.body.appendChild(status);

  setTimeout(() => {
    status.remove();
  }, 3000);
}

function showLoginStatus(message, type = 'info') {
  loginStatus.className = `status-message ${type}`;
  loginStatus.textContent = message;
  if (type === 'success') {
    setTimeout(() => {
      loginStatus.textContent = '';
    }, 3000);
  }
}
