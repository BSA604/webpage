const CLOUDINARY_CLOUD = 'drex1jrqe';
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}`;
const FOLDER_PREFIX = 'Marengo Cave';

const eventFilter = document.getElementById('eventFilter');
const galleryContainer = document.getElementById('galleryContainer');

const state = {
  folders: [],
  selectedFolder: ''
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadFolders();
});

async function loadFolders() {
  try {
    // Cloudinary admin APIs such as /folders require signed requests and are not CORS-enabled
    // for browser-originated requests. The API secret must never be exposed in frontend code.
    throw new Error('Cloudinary folder listing cannot be performed directly from browser code. Use a server-side proxy or static gallery metadata instead.');
  } catch (error) {
    console.error('Error loading folders:', error);
    galleryContainer.innerHTML = '<div class="error">Unable to load gallery folders. This page requires a server-side Cloudinary proxy or static gallery data.</div>';
  }
}
