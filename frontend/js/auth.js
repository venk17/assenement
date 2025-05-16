document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.getElementById('login-tab').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('signup-tab').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
        document.getElementById('signup-form').classList.remove('active');
    });
    
    document.getElementById('signup-tab').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('login-tab').classList.remove('active');
        document.getElementById('signup-form').classList.add('active');
        document.getElementById('login-form').classList.remove('active');
    });
    
    // Login functionality
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('signup-btn').addEventListener('click', signup);
    
    // Check if user is already logged in
    if (localStorage.getItem('token')) {
        window.location.href = 'search.html';
    }
});

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            window.location.href = 'search.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}

async function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Signup successful! Please login.');
            document.getElementById('login-tab').click();
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during signup');
    }
}