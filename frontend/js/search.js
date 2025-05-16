document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('search-btn').addEventListener('click', searchCodes);
    document.getElementById('save-list-btn').addEventListener('click', saveList);
    
    // Enable save button only when there are results and a name is provided
    document.getElementById('list-name').addEventListener('input', function() {
        const hasResults = document.querySelectorAll('.dog-image').length > 0;
        const hasName = this.value.trim() !== '';
        document.getElementById('save-list-btn').disabled = !(hasResults && hasName);
    });
});

let currentResults = [];

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

async function searchCodes() {
    const filter = document.getElementById('code-filter').value.trim();
    
    if (!filter) {
        alert('Please enter a filter');
        return;
    }
    
    try {
        const response = await fetch(`/api/search?filter=${encodeURIComponent(filter)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentResults = data;
            displayResults(data);
            document.getElementById('save-list-btn').disabled = true;
        } else {
            alert(data.message || 'Search failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during search');
    }
}

function displayResults(results) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p>No results found for your filter.</p>';
        return;
    }
    
    results.forEach(item => {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'dog-image';
        
        const img = document.createElement('img');
        img.src = `https://http.dog/${item.code}.jpg`;
        img.alt = `HTTP ${item.code}`;
        
        const codeText = document.createElement('p');
        codeText.textContent = item.code;
        
        imgDiv.appendChild(img);
        imgDiv.appendChild(codeText);
        container.appendChild(imgDiv);
    });
}

async function saveList() {
    const listName = document.getElementById('list-name').value.trim();
    
    if (!listName) {
        alert('Please enter a list name');
        return;
    }
    
    if (currentResults.length === 0) {
        alert('No results to save');
        return;
    }
    
    try {
        const response = await fetch('/api/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: listName,
                response_codes: currentResults.map(item => item.code)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('List saved successfully!');
            document.getElementById('list-name').value = '';
            currentResults = [];
            document.getElementById('results-container').innerHTML = '';
            document.getElementById('save-list-btn').disabled = true;
        } else {
            alert(data.message || 'Failed to save list');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the list');
    }
}