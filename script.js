// Select elements with querySelector
const noteForm = document.querySelector('#note-form');
const noteInput = document.querySelector('#note-input');
const noteCategory = document.querySelector('#note-category');
const notesList = document.querySelector('#notes-list');
const errorMessage = document.querySelector('#error-message');
const noteCount = document.querySelector('#note-count');
const searchInput = document.querySelector('#search-input');

// Notes stored as an array of objects, loaded from localStorage if available
let notes = JSON.parse(localStorage.getItem('quicknotes')) || [];

// Helper function to save notes to localStorage
function saveNotes() {
  localStorage.setItem('quicknotes', JSON.stringify(notes));
}

// Helper function for a readable date and time
function getReadableDate() {
  const now = new Date();
  return now.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Update the note count message correctly
function updateNoteCount() {
  const count = notes.length;
  if (count === 0) {
    noteCount.textContent = 'You have no notes yet.';
  } else if (count === 1) {
    noteCount.textContent = 'You have 1 note.';
  } else {
    noteCount.textContent = `You have ${count} notes.`;
  }
}

// Render function rebuilding the list using createElement and textContent
function render() {
  notesList.innerHTML = '';

  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // Filter notes based on search query (case-insensitive)
  const filteredNotes = notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm)
  );

  // If search finds nothing and user typed a search term
  if (filteredNotes.length === 0 && searchTerm !== '') {
    const noMatchLi = document.createElement('li');
    noMatchLi.textContent = 'No notes match your search.';
    noMatchLi.style.textAlign = 'center';
    noMatchLi.style.color = '#4b5563';
    noMatchLi.style.padding = '1rem';
    notesList.appendChild(noMatchLi);
    updateNoteCount();
    return;
  }

  // If there are no notes at all and no search term
  if (notes.length === 0) {
    updateNoteCount();
    return;
  }

  filteredNotes.forEach((note) => {
    const li = document.createElement('li');
    li.className = `note-card category-${note.category.toLowerCase()}`;

    // Note text element (safe from XSS using textContent)
    const textP = document.createElement('p');
    textP.textContent = note.text;
    textP.style.margin = '0 0 0.75rem 0';

    // Footer info container for category, date, and delete button
    const footerDiv = document.createElement('div');
    footerDiv.style.display = 'flex';
    footerDiv.style.justifyContent = 'space-between';
    footerDiv.style.alignItems = 'center';
    footerDiv.style.fontSize = '0.85rem';
    footerDiv.style.color = '#4b5563';

    // Small category label
    const categorySpan = document.createElement('span');
    categorySpan.textContent = note.category;
    categorySpan.style.fontWeight = '600';

    // Date and time label
    const dateSpan = document.createElement('span');
    dateSpan.textContent = note.createdAt;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.padding = '0.25rem 0.5rem';
    deleteBtn.style.fontSize = '0.75rem';
    deleteBtn.style.backgroundColor = '#dc2626';
    deleteBtn.style.marginLeft = '1rem';
    deleteBtn.addEventListener('click', () => {
      deleteNote(note.id);
    });

    const metaGroup = document.createElement('div');
    metaGroup.appendChild(categorySpan);
    metaGroup.appendChild(document.createTextNode(' | '));
    metaGroup.appendChild(dateSpan);

    footerDiv.appendChild(metaGroup);
    footerDiv.appendChild(deleteBtn);

    li.appendChild(textP);
    li.appendChild(footerDiv);

    notesList.appendChild(li);
  });

  updateNoteCount();
}

// Delete note by id
function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  saveNotes();
  render();
}

// Form submission handler with validation
noteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const rawText = noteInput.value;

  // Validation: empty or only spaces
  if (rawText.trim() === '') {
    errorMessage.textContent = 'Please type a note first.';
    return;
  }

  // Validation: over 200 characters
  if (rawText.length > 200) {
    errorMessage.textContent = 'Notes must be 200 characters or fewer.';
    return;
  }

  // Clear any existing error message if valid
  errorMessage.textContent = '';

  const newNote = {
    id: Date.now(),
    text: rawText.trim(),
    category: noteCategory.value,
    createdAt: getReadableDate()
  };

  notes.push(newNote);
  saveNotes();
  
  // Clear the input after adding
  noteInput.value = '';

  render();
});

// Event listener for search input
searchInput.addEventListener('input', () => {
  render();
});

// Initial render
render();