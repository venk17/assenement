document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Utils.checkAuth();
  if (!currentUser) return;

  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const resultsContainer = document.getElementById('results-container');
  const saveListForm = document.getElementById('save-list-form');
  const listNameInput = document.getElementById('list-name');
  const saveListBtn = document.getElementById('save-list-btn');
  const saveListError = document.getElementById('save-list-error');
  const saveListSuccess = document.getElementById('save-list-success');
  const logoutBtn = document.getElementById('logout-btn');

  let currentResults = [];

  // Logout functionality
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  });

  // Search functionality
  searchBtn.addEventListener('click', () => {
    const filter = searchInput.value;
    const parsedFilter = Utils.parseFilter(filter);

    if (!parsedFilter) {
      resultsContainer.innerHTML = '<p>Please enter a valid filter (e.g., 200, 2xx, 20x)</p>';
      saveListForm.classList.add('hidden');
      return;
    }

    currentResults = [];

    if (parsedFilter.exact) {
      // Single code match
      currentResults.push(parsedFilter.exact);
    } else if (parsedFilter.range) {
      // Range match
      const [start, end] = parsedFilter.range.split('-').map(Number);
      for (let code = start; code <= end; code++) {
        // Only include valid HTTP status codes
        if (code >= 100 && code <= 599) {
          currentResults.push(code.toString());
        }
      }
    }

    displayResults(currentResults);
    saveListForm.classList.remove('hidden');
  });

  // Display search results
  function displayResults(codes) {
    resultsContainer.innerHTML = '';

    if (codes.length === 0) {
      resultsContainer.innerHTML = '<p>No results found</p>';
      return;
    }

    codes.forEach(code => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `
        <img src="${Utils.getDogImage(code)}" alt="HTTP Dog ${code}" onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Found'">
        <div class="code">${code}</div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // Save list functionality
  saveListBtn.addEventListener('click', () => {
    const listName = listNameInput.value.trim();

    if (!listName) {
      Utils.showAlert(saveListError, 'Please enter a list name');
      return;
    }

    if (currentResults.length === 0) {
      Utils.showAlert(saveListError, 'No results to save');
      return;
    }

    const lists = JSON.parse(localStorage.getItem('lists')) || [];
    const userLists = lists.filter(list => list.userId === currentUser.id);
    
    // Check if list name already exists
    if (userLists.some(list => list.name.toLowerCase() === listName.toLowerCase())) {
      Utils.showAlert(saveListError, 'List name already exists');
      return;
    }

    const newList = {
      id: Date.now(),
      userId: currentUser.id,
      name: listName,
      codes: currentResults,
      createdAt: new Date().toISOString()
    };

    lists.push(newList);
    localStorage.setItem('lists', JSON.stringify(lists));

    Utils.showAlert(saveListSuccess, 'List saved successfully!', false);
    listNameInput.value = '';
    setTimeout(() => {
      saveListForm.classList.add('hidden');
    }, 1500);
  });

  // Allow search on Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
});