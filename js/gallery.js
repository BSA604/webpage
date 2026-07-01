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
});

async function loadFolders() {
  try {
    const response = await fetch(FOLDERS_API, {
      headers: {
        Authorization: 'Basic ' + btoa('727385161984683:pzgM2TDo39iec6fj__FCp5hchEk')
      }
    });
    const data = await response.json();
    console.log('Fetched folders:', data);
  } catch (error) {
    console.error('Error loading folders:', error);
    galleryContainer.innerHTML = '<div class="error">Unable to load gallery folders.</div>';
  }
}
