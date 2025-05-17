document.addEventListener('DOMContentLoaded', () => {
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');
  const signupSuccess = document.getElementById('signup-success');

  // Switch between login and signup tabs
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Login functionality
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      Utils.showAlert(loginError, 'Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = 'search.html';
    } else {
      Utils.showAlert(loginError, 'Invalid email or password');
    }
  });

  // Signup functionality
  signupBtn.addEventListener('click', () => {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!name || !email || !password || !confirmPassword) {
      Utils.showAlert(signupError, 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Utils.showAlert(signupError, 'Passwords do not match');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.email === email);

    if (userExists) {
      Utils.showAlert(signupError, 'Email already registered');
      return;
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    Utils.showAlert(signupSuccess, 'Account created successfully! Please login.', false);
    setTimeout(() => {
      loginTab.click();
      document.getElementById('login-email').value = email;
      document.getElementById('login-password').value = '';
      document.getElementById('signup-name').value = '';
      document.getElementById('signup-password').value = '';
      document.getElementById('signup-confirm-password').value = '';
    }, 1500);
  });

  // Check if user is already logged in
  if (Utils.checkAuth() && window.location.href.includes('index.html')) {
    window.location.href = 'search.html';
  }
});