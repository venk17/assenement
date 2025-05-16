document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('back-to-lists-btn').addEventListener('click', showLists);
    document.getElementById('delete-list-btn').addEventListener('click', deleteList);
    document.getElementById('edit-list-btn').addEventListener('click', editList);
    
    loadUserLists();
});

let currentListId = null;

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

async function loadUserLists() {
    try {
        const response = await fetch('/api/lists', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayLists(data);
        } else {
            alert(data.message || 'Failed to load lists');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while loading lists');
    }
}

function displayLists(lists) {
    const container = document.getElementById('lists-container');
    container.innerHTML = '';
    
    if (lists.length === 0) {
        container.innerHTML = '<p>You have no saved lists yet.</p>';
        return;
    }
    
    lists.forEach(list => {
        const listDiv = document.createElement('div');
        listDiv.className = 'list-item';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'list-name';
        nameDiv.textContent = list.name;
        nameDiv.addEventListener('click', () => showListDetails(list));
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'list-date';
        dateDiv.textContent = new Date(list.created_at).toLocaleDateString();
        
        listDiv.appendChild(nameDiv);
        listDiv.appendChild(dateDiv);
        container.appendChild(listDiv);
    });
}

function showListDetails(list) {
    currentListId = list.id;
    
    document.getElementById('lists-container').classList.add('hidden');
    document.getElementById('list-details').classList.remove('hidden');
    
    document.getElementById('list-details-title').textContent = list.name;
    
    const imagesContainer = document.getElementById('list-details-images');
    imagesContainer.innerHTML = '';
    
    list.response_codes.forEach(code => {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'dog-image';
        
        const img = document.createElement('img');
        img.src = `https://http.dog/${code}.jpg`;
        img.alt = `HTTP ${code}`;
        
        const codeText = document.createElement('p');
        codeText.textContent = code;
        
        imgDiv.appendChild(img);
        imgDiv.appendChild(codeText);
        imagesContainer.appendChild(imgDiv);
    });
}

function showLists() {
    document.getElementById('lists-container').classList.remove('hidden');
    document.getElementById('list-details').classList.add('hidden');
    currentListId = null;
}

async function deleteList() {
    if (!currentListId) return;
    
    if (!confirm('Are you sure you want to delete this list?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/lists/${currentListId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('List deleted successfully');
            showLists();
            loadUserLists();
        } else {
            alert(data.message || 'Failed to delete list');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the list');
    }
}

function editList() {
    if (!currentListId) return;
    
    // For simplicity, we'll just redirect to search with the codes as a filter
    // In a real app, you might have a more sophisticated editing interface
    const list = document.getElementById('list-details-title').textContent;
    const codes = Array.from(document.querySelectorAll('#list-details-images .dog-image p'))
        .map(el => el.textContent)
        .join(',');
    
    localStorage.setItem('editList', JSON.stringify({
        id: currentListId,
        name: list,
        codes: codes
    }));
    
    window.location.href = 'search.html';
}