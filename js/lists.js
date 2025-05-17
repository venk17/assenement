document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Utils.checkAuth();
  if (!currentUser) return;

  const listsContainer = document.getElementById('lists-container');
  const logoutBtn = document.getElementById('logout-btn');
  const editModal = document.getElementById('edit-modal');
  const editModalClose = editModal.querySelector('.modal-close');
  const editListName = document.getElementById('edit-list-name');
  const editImagesContainer = document.getElementById('edit-images-container');
  const updateListBtn = document.getElementById('update-list-btn');
  const editListError = document.getElementById('edit-list-error');
  const viewModal = document.getElementById('view-modal');
  const viewModalClose = viewModal.querySelector('.modal-close');
  const viewListTitle = document.getElementById('view-list-title');
  const viewImagesContainer = document.getElementById('view-images-container');

  let currentEditListId = null;

  // Logout functionality
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  });

  // Load user's lists
  function loadLists() {
    const lists = JSON.parse(localStorage.getItem('lists')) || [];
    const userLists = lists.filter(list => list.userId === currentUser.id);

    listsContainer.innerHTML = '';

    if (userLists.length === 0) {
      listsContainer.innerHTML = '<p>You have no saved lists yet.</p>';
      return;
    }

    userLists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    userLists.forEach(list => {
      const listItem = document.createElement('div');
      listItem.className = 'list-item card';
      listItem.innerHTML = `
        <div class="list-item-header">
          <h3>${list.name}</h3>
          <div class="list-item-actions">
            <button class="btn btn-secondary view-list-btn" data-id="${list.id}">View</button>
            <button class="btn edit-list-btn" data-id="${list.id}">Edit</button>
            <button class="btn btn-danger delete-list-btn" data-id="${list.id}">Delete</button>
          </div>
        </div>
        <div class="list-item-details">
          <span>${list.codes.length} codes</span>
          <span>•</span>
          <span>Created ${Utils.formatDate(list.createdAt)}</span>
        </div>
      `;
      listsContainer.appendChild(listItem);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.view-list-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const listId = parseInt(e.target.getAttribute('data-id'));
        viewList(listId);
      });
    });

    document.querySelectorAll('.edit-list-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const listId = parseInt(e.target.getAttribute('data-id'));
        openEditModal(listId);
      });
    });

    document.querySelectorAll('.delete-list-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const listId = parseInt(e.target.getAttribute('data-id'));
        deleteList(listId);
      });
    });
  }

  // View list functionality
  function viewList(listId) {
    const lists = JSON.parse(localStorage.getItem('lists')) || [];
    const list = lists.find(l => l.id === listId);

    if (!list) return;

    viewListTitle.textContent = list.name;
    viewImagesContainer.innerHTML = '';

    list.codes.forEach(code => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `
        <img src="${Utils.getDogImage(code)}" alt="HTTP Dog ${code}" onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Found'">
        <div class="code">${code}</div>
      `;
      viewImagesContainer.appendChild(card);
    });

    viewModal.classList.add('active');
  }

  // Open edit modal
  function openEditModal(listId) {
    const lists = JSON.parse(localStorage.getItem('lists')) || [];
    const list = lists.find(l => l.id === listId);

    if (!list) return;

    currentEditListId = listId;
    editListName.value = list.name;
    editImagesContainer.innerHTML = '';

    list.codes.forEach(code => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `
        <img src="${Utils.getDogImage(code)}" alt="HTTP Dog ${code}" onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Found'">
        <div class="code">${code}</div>
        <button class="btn btn-danger remove-code-btn" data-code="${code}">Remove</button>
      `;
      editImagesContainer.appendChild(card);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-code-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const codeToRemove = e.target.getAttribute('data-code');
        const card = e.target.closest('.image-card');
        card.remove();
      });
    });

    editModal.classList.add('active');
  }

  // Update list functionality
  updateListBtn.addEventListener('click', () => {
    const newName = editListName.value.trim();
    const remainingCodes = Array.from(editImagesContainer.querySelectorAll('.image-card'))
      .map(card => card.querySelector('.code').textContent);

    if (!newName) {
      Utils.showAlert(editListError, 'Please enter a list name');
      return;
    }

    if (remainingCodes.length === 0) {
      Utils.showAlert(editListError, 'List must have at least one code');
      return;
    }

    const lists = JSON.parse(localStorage.getItem('lists')) || [];
    const listIndex = lists.findIndex(l => l.id === currentEditListId);

    if (listIndex === -1) return;

    // Check if new name conflicts with other lists
    const hasNameConflict = lists.some((list, index) => 
      index !== listIndex && 
      list.userId === currentUser.id && 
      list.name.toLowerCase() === newName.toLowerCase()
    );

    if (hasNameConflict) {
      Utils.showAlert(editListError, 'List name already exists');
      return;
    }

    lists[listIndex] = {
      ...lists[listIndex],
      name: newName,
      codes: remainingCodes
    };

    localStorage.setItem('lists', JSON.stringify(lists));
    loadLists();
    editModal.classList.remove('active');
  });

  // Delete list functionality
  function deleteList(listId) {
    if (!confirm('Are you sure you want to delete this list?')) return;

    const lists = JSON.parse(localStorage.getItem('lists')) || [];
    const updatedLists = lists.filter(l => l.id !== listId);
    localStorage.setItem('lists', JSON.stringify(updatedLists));
    loadLists();
  }

  // Close modals
  editModalClose.addEventListener('click', () => {
    editModal.classList.remove('active');
  });

  viewModalClose.addEventListener('click', () => {
    viewModal.classList.remove('active');
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.classList.remove('active');
    }
    if (e.target === viewModal) {
      viewModal.classList.remove('active');
    }
  });

  // Initial load
  loadLists();
});