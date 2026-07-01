const CLOUDINARY_CLOUD = 'drex1jrqe';
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}`;
const FOLDERS_API = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/folders`;
const FOLDER_PREFIX = 'Marengo Cave';

const eventFilter = document.getElementById('eventFilter');
const galleryContainer = document.getElementById('galleryContainer');

const state = {
  folders: [],
  selectedFolder: ''
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadFolders();
  setupEventListeners();
  if (state.folders.length) {
    state.selectedFolder = state.folders[0].path;
    eventFilter.value = state.selectedFolder;
    await loadGallery(state.selectedFolder);
  }
});

function setupEventListeners() {
  eventFilter.addEventListener('change', async () => {
    state.selectedFolder = eventFilter.value;
    await loadGallery(state.selectedFolder);
  });
}

async function loadFolders() {
  try {
    const response = await fetch(FOLDERS_API, {
      headers: {
        Authorization: 'Basic ' + btoa('727385161984683:pzgM2TDo39iec6fj__FCp5hchEk')
      }
    });
    const data = await response.json();
    console.log('Fetched folders:', data);
    const folders = Array.isArray(data.folders)
      ? data.folders
          .filter(folder => folder.path === FOLDER_PREFIX || folder.path.startsWith(`${FOLDER_PREFIX}/`))
          .map(folder => ({
            name: folder.name,
            path: folder.path
          }))
      : [];

    state.folders = folders;
    eventFilter.innerHTML = '<option value="">Select an event</option>';
    folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.path;
      option.textContent = folder.name;
      eventFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading folders:', error);
    galleryContainer.innerHTML = '<div class="error">Unable to load gallery folders.</div>';
  }
}

async function loadGallery(folderPath) {
  galleryContainer.innerHTML = '<div class="loading">Loading photos...</div>';

  try {
    const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/${encodeURIComponent(folderPath)}.json`);
    const data = await response.json();
    const items = Array.isArray(data.resources) ? data.resources : [];

    if (!items.length) {
      galleryContainer.innerHTML = '<div class="no-photos">No photos yet for this event.</div>';
      return;
    }

    galleryContainer.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      const imageUrl = `${CLOUDINARY_BASE}/image/upload/${item.public_id}`;
      card.innerHTML = `
        <img src="${imageUrl}" alt="Gallery photo" loading="lazy" />
      `;
      galleryContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading gallery:', error);
    galleryContainer.innerHTML = '<div class="error">Unable to load photos for this event.</div>';
  }
}
