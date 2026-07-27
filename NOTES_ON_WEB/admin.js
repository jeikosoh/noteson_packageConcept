let currentData = null;
let store = null;

document.addEventListener("DOMContentLoaded", async () => {
  store = window.notesOnDataStore;
  currentData = store ? await store.loadDataAsync() : null;
  
  // Hide loading overlay
  const loader = document.getElementById('loading-overlay');
  if (loader) loader.style.display = 'none';
  
  if (!currentData) return; // Wait for it to load
  
  // Navigation
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.admin-section');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // Product Tabs
  let activeProductIndex = 0;
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Save current card before switching
      saveProductCardToState(activeProductIndex);
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeProductIndex = parseInt(btn.dataset.card, 10);
      populateProductCardForm(activeProductIndex);
    });
  });

  // --- POPULATE FORMS ---
  function populateForms() {
    // 0. Main Bg
    if (!currentData.mainBg) currentData.mainBg = { image: "" };
    document.getElementById('main-bg-url').value = currentData.mainBg.image || "";
    if (currentData.mainBg.image) {
      const prev = document.getElementById('main-bg-preview');
      prev.src = currentData.mainBg.image;
      prev.style.display = 'block';
    }

    // 1. Tea of the month
    const tea = currentData.teaOfTheMonth;
    document.getElementById('tea-name').value = tea.name;
    document.getElementById('tea-country').value = tea.description.country;
    // Map boolean to string for backward compatibility, or use string directly
    document.getElementById('tea-caffeine').value = tea.description.caffeine === true ? 'Caffeine' : (tea.description.caffeine === false ? 'Caffeine-free' : tea.description.caffeine);
    document.getElementById('tea-taste-notes').value = tea.description.tasteNotes.join(', ');
    
    // Recipes - Hot
    document.getElementById('recipe-hot-active').checked = tea.recipes.hot.active;
    document.getElementById('recipe-hot-amount').value = tea.recipes.hot.amount;
    document.getElementById('recipe-hot-temp').value = tea.recipes.hot.temp;
    document.getElementById('recipe-hot-time').value = tea.recipes.hot.time;
    // Recipes - Iced
    document.getElementById('recipe-iced-active').checked = tea.recipes.iced.active;
    document.getElementById('recipe-iced-amount').value = tea.recipes.iced.amount;
    document.getElementById('recipe-iced-temp').value = tea.recipes.iced.temp;
    document.getElementById('recipe-iced-time').value = tea.recipes.iced.time;
    document.getElementById('recipe-iced-ice').checked = !!tea.recipes.iced.ice;
    // Recipes - Cold Brew
    if (tea.recipes.coldbrew) {
      document.getElementById('recipe-coldbrew-active').checked = tea.recipes.coldbrew.active;
      document.getElementById('recipe-coldbrew-amount').value = tea.recipes.coldbrew.amount;
      document.getElementById('recipe-coldbrew-temp').value = tea.recipes.coldbrew.temp;
      document.getElementById('recipe-coldbrew-time').value = tea.recipes.coldbrew.time;
      document.getElementById('recipe-coldbrew-ice').checked = !!tea.recipes.coldbrew.ice;
    }
    
    // Story
    document.getElementById('tea-story-title').value = tea.story.title;
    document.getElementById('tea-story-body').value = tea.story.body;

    // 2. Calendar - render the list
    renderCalendarEvents();

    // 3. Video Player
    document.getElementById('video-url').value = currentData.videoPlayer.videoUrl;
    document.getElementById('video-title').value = currentData.videoPlayer.title;

    // 4. Product Cards - ensure 4 cards exist
    while (currentData.productCards.length < 4) {
      currentData.productCards.push({
        id: "prod-" + (currentData.productCards.length + 1),
        active: false,
        type: currentData.productCards.length % 2 === 0 ? "portrait" : "landscape",
        image: "", name: "", origin: "",
        badge: { active: false, text: "NEW", bgColor: "#000000", textColor: "#ffffff" },
        dynamicLabel: { title: "", productName: "" }
      });
    }
    populateProductCardForm(activeProductIndex);
  }

  function populateProductCardForm(index) {
    const card = currentData.productCards[index];
    if (!card) return;
    document.getElementById('prod-active').checked = card.active !== false;
    document.getElementById('prod-image').value = card.image;
    document.getElementById('prod-name').value = card.name;
    document.getElementById('prod-origin').value = card.origin;
    
    document.getElementById('prod-badge-active').checked = card.badge.active;
    document.getElementById('prod-badge-text').value = card.badge.text;
    document.getElementById('prod-badge-bg').value = card.badge.bgColor;
    document.getElementById('prod-badge-text-color').value = card.badge.textColor;
    
    document.getElementById('prod-dl-title').value = card.dynamicLabel.title;
    document.getElementById('prod-dl-name').value = card.dynamicLabel.productName;
  }

  // --- SAVE FORMS ---
  function saveProductCardToState(index) {
    const card = currentData.productCards[index];
    if (!card) return;
    card.active = document.getElementById('prod-active').checked;
    card.image = document.getElementById('prod-image').value;
    card.name = document.getElementById('prod-name').value;
    card.origin = document.getElementById('prod-origin').value;
    
    card.badge.active = document.getElementById('prod-badge-active').checked;
    card.badge.text = document.getElementById('prod-badge-text').value;
    card.badge.bgColor = document.getElementById('prod-badge-bg').value;
    card.badge.textColor = document.getElementById('prod-badge-text-color').value;
    
    card.dynamicLabel.title = document.getElementById('prod-dl-title').value;
    card.dynamicLabel.productName = document.getElementById('prod-dl-name').value;
  }

  document.getElementById('save-all-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-all-btn');
    const originalText = btn.innerText;
    btn.innerText = "Saving to cloud...";
    btn.style.backgroundColor = "#ff9800"; // orange while saving

    // Collect Main Bg
    if (!currentData.mainBg) currentData.mainBg = { image: "" };
    currentData.mainBg.image = document.getElementById('main-bg-url').value;

    // Collect Tea data
    currentData.teaOfTheMonth.name = document.getElementById('tea-name').value;
    currentData.teaOfTheMonth.description.country = document.getElementById('tea-country').value;
    currentData.teaOfTheMonth.description.caffeine = document.getElementById('tea-caffeine').value;
    currentData.teaOfTheMonth.description.tasteNotes = document.getElementById('tea-taste-notes').value.split(',').map(s => s.trim()).slice(0, 6);
    
    // Recipes
    currentData.teaOfTheMonth.recipes.hot.active = document.getElementById('recipe-hot-active').checked;
    currentData.teaOfTheMonth.recipes.hot.amount = document.getElementById('recipe-hot-amount').value;
    currentData.teaOfTheMonth.recipes.hot.temp = document.getElementById('recipe-hot-temp').value;
    currentData.teaOfTheMonth.recipes.hot.time = document.getElementById('recipe-hot-time').value;
    currentData.teaOfTheMonth.recipes.hot.ice = false;
    
    currentData.teaOfTheMonth.recipes.iced.active = document.getElementById('recipe-iced-active').checked;
    currentData.teaOfTheMonth.recipes.iced.amount = document.getElementById('recipe-iced-amount').value;
    currentData.teaOfTheMonth.recipes.iced.temp = document.getElementById('recipe-iced-temp').value;
    currentData.teaOfTheMonth.recipes.iced.time = document.getElementById('recipe-iced-time').value;
    currentData.teaOfTheMonth.recipes.iced.ice = document.getElementById('recipe-iced-ice').checked;

    if (!currentData.teaOfTheMonth.recipes.coldbrew) currentData.teaOfTheMonth.recipes.coldbrew = {};
    currentData.teaOfTheMonth.recipes.coldbrew.active = document.getElementById('recipe-coldbrew-active').checked;
    currentData.teaOfTheMonth.recipes.coldbrew.amount = document.getElementById('recipe-coldbrew-amount').value;
    currentData.teaOfTheMonth.recipes.coldbrew.temp = document.getElementById('recipe-coldbrew-temp').value;
    currentData.teaOfTheMonth.recipes.coldbrew.time = document.getElementById('recipe-coldbrew-time').value;
    currentData.teaOfTheMonth.recipes.coldbrew.ice = document.getElementById('recipe-coldbrew-ice').checked;

    currentData.teaOfTheMonth.story.title = document.getElementById('tea-story-title').value;
    currentData.teaOfTheMonth.story.body = document.getElementById('tea-story-body').value;

    // Collect Video Player
    currentData.videoPlayer.videoUrl = document.getElementById('video-url').value;
    currentData.videoPlayer.title = document.getElementById('video-title').value;

    // Collect Product Card (active one)
    saveProductCardToState(activeProductIndex);

    // Save to Firestore
    try {
      await store.saveDataAsync(currentData);
      
      // Provide feedback
      btn.innerText = "Saved!";
      btn.style.backgroundColor = "#4caf50";
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
      }, 2000);
    } catch (e) {
      alert("Failed to save to cloud.");
      btn.innerText = originalText;
      btn.style.backgroundColor = "";
    }
  });

  // Main Bg Image Upload Logic
  document.getElementById('main-bg-url').addEventListener('input', (e) => {
    const val = e.target.value;
    const prev = document.getElementById('main-bg-preview');
    if (val) {
      prev.src = val;
      prev.style.display = 'block';
    } else {
      prev.style.display = 'none';
    }
  });

  document.getElementById('main-bg-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = async function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = width * ratio;
            height = height * ratio;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          document.getElementById('main-bg-url').value = dataUrl;
          const prev = document.getElementById('main-bg-preview');
          prev.src = dataUrl;
          prev.style.display = 'block';
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Initialize
  populateForms();
});

// --- CALENDAR EVENTS LOGIC ---
let editingEventIndex = -1;

function renderCalendarEvents() {
  const listContainer = document.getElementById('cal-events-list');
  listContainer.innerHTML = '';
  
  if (currentData.calendar.events.length === 0) {
    listContainer.innerHTML = '<p style="color:#666; font-size:14px;">No events saved yet.</p>';
    return;
  }
  
  currentData.calendar.events.forEach((ev, idx) => {
    const card = document.createElement('div');
    card.className = 'cal-event-card';
    
    card.innerHTML = `
      <img src="${ev.thumbnail || 'NOTES_ON_WEB/_ASSETS/placeholder.png'}" class="cal-event-thumb" alt="Thumbnail">
      <div class="cal-event-info">
        <h4>${ev.title1 || ev.title || 'Untitled'} ${ev.title2 ? '<br>'+ev.title2 : ''}</h4>
        <p><strong>Date:</strong> ${ev.date}</p>
        <p><strong>Location:</strong> ${ev.location}</p>
      </div>
      <div class="cal-event-actions">
        <button class="cal-btn" onclick="editCalendarEvent(${idx})">Edit</button>
        <button class="cal-btn delete" onclick="deleteCalendarEvent(${idx})">Delete</button>
      </div>
    `;
    listContainer.appendChild(card);
  });
}

function clearCalendarForm() {
  document.getElementById('cal-date').value = '';
  document.getElementById('cal-title-1').value = '';
  document.getElementById('cal-title-2').value = '';
  document.getElementById('cal-location').value = '';
  document.getElementById('cal-thumbnail').value = '';
  document.getElementById('cal-thumbnail-file').value = '';
  editingEventIndex = -1;
  document.getElementById('add-event-btn').innerText = 'Add Event';
  document.getElementById('cancel-event-btn').style.display = 'none';
}

window.editCalendarEvent = function(idx) {
  const ev = currentData.calendar.events[idx];
  document.getElementById('cal-date').value = ev.date;
  document.getElementById('cal-title-1').value = ev.title1 || ev.title || '';
  document.getElementById('cal-title-2').value = ev.title2 || '';
  document.getElementById('cal-location').value = ev.location;
  document.getElementById('cal-thumbnail').value = ev.thumbnail;
  
  editingEventIndex = idx;
  document.getElementById('add-event-btn').innerText = 'Update Event';
  document.getElementById('cancel-event-btn').style.display = 'inline-block';
};

window.deleteCalendarEvent = async function(idx) {
  if(confirm('Are you sure you want to delete this event?')) {
    const deletedEvent = currentData.calendar.events[idx];
    currentData.calendar.events.splice(idx, 1);
    try {
      if (store) await store.saveDataAsync(currentData);
      renderCalendarEvents();
    } catch (e) {
      alert("Failed to delete from cloud. Reverting...\nReason: " + e.message);
      currentData.calendar.events.splice(idx, 0, deletedEvent); // Revert
      renderCalendarEvents(); // Re-render to ensure UI and Data are synced
    }
  }
};

window.cancelCalendarEdit = function(e) {
  if(e) e.preventDefault();
  clearCalendarForm();
};

window.addCalendarEvent = async function(e) {
  if(e) e.preventDefault();
  
  const btn = document.querySelector('button[onclick="addCalendarEvent(event)"]');
  const originalText = btn.innerText;
  
  const fileInput = document.getElementById('cal-thumbnail-file');
  const dateStr = document.getElementById('cal-date').value;
  const title1Str = document.getElementById('cal-title-1').value;
  const title2Str = document.getElementById('cal-title-2').value;
  const locStr = document.getElementById('cal-location').value;
  let thumbStr = document.getElementById('cal-thumbnail').value;

  // Basic Validation
  if (!dateStr || !title1Str) {
    alert("Please fill in at least the Event Date and Title 1.");
    return;
  }
  
  btn.innerText = "Saving to cloud...";
  btn.style.backgroundColor = "#ff9800";
  btn.disabled = true;

  const saveOrUpdateEvent = async (finalThumb) => {
    const newEvent = {
      date: dateStr,
      title1: title1Str,
      title2: title2Str,
      location: locStr,
      thumbnail: finalThumb
    };
    
    // Ensure array exists
    if (!currentData.calendar) currentData.calendar = { events: [] };
    if (!currentData.calendar.events) currentData.calendar.events = [];
    
    if (editingEventIndex >= 0) {
      currentData.calendar.events[editingEventIndex] = newEvent;
    } else {
      currentData.calendar.events.push(newEvent);
    }
    
    // Auto save for Calendar
    try {
      if (store) await store.saveDataAsync(currentData);
    } catch (e) {
      console.error(e);
      alert("Failed to save event to the cloud.");
      // Rollback
      if (editingEventIndex < 0) currentData.calendar.events.pop();
      btn.innerText = originalText;
      btn.style.backgroundColor = "";
      btn.disabled = false;
      return;
    }
    
    clearCalendarForm();
    renderCalendarEvents();
    
    // Feedback to user
    btn.innerText = originalText;
    btn.style.backgroundColor = "";
    btn.disabled = false;
    alert(editingEventIndex >= 0 ? "Event updated successfully!" : "Event added successfully!");
  };

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = async function() {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Upload to Firebase Storage
        try {
          const storageRef = window.storage.ref();
          const fileRef = storageRef.child('calendar_thumbs/' + Date.now() + '.jpg');
          await fileRef.putString(dataUrl, 'data_url');
          const downloadURL = await fileRef.getDownloadURL();
          saveOrUpdateEvent(downloadURL);
        } catch(err) {
          console.error("Storage upload error", err);
          alert("Failed to upload image to Firebase Storage.");
          btn.innerText = originalText;
          btn.style.backgroundColor = "";
          btn.disabled = false;
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    saveOrUpdateEvent(thumbStr);
  }
};
