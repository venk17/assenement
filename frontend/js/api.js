// This would be extended with more API calls as needed
async function getResponseCodes(filter) {
    try {
        const response = await fetch(`/api/search?filter=${encodeURIComponent(filter)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch response codes');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Check if we're editing a list when search page loads
if (window.location.pathname.endsWith('search.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const editData = localStorage.getItem('editList');
        if (editData) {
            try {
                const { name, codes } = JSON.parse(editData);
                document.getElementById('code-filter').value = codes;
                document.getElementById('list-name').value = `${name} (Edited)`;
                document.getElementById('search-btn').click();
            } catch (e) {
                console.error('Error parsing edit data:', e);
            } finally {
                localStorage.removeItem('editList');
            }
        }
    });
}