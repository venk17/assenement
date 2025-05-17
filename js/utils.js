// Utility functions
const Utils = {
  // Check if user is logged in
  checkAuth: () => {
    const user = localStorage.getItem('currentUser');
    if (!user && !window.location.href.includes('index.html')) {
      window.location.href = 'index.html';
    }
    return user ? JSON.parse(user) : null;
  },

  // Parse response code filter
  parseFilter: (filter) => {
    if (!filter) return null;
    
    filter = filter.trim().toLowerCase();
    
    // Exact match (e.g., "200")
    if (/^\d{3}$/.test(filter)) {
      return { exact: filter };
    }
    
    // Range match (e.g., "2xx", "20x")
    if (/^[1-5]xx$/.test(filter)) {
      const firstDigit = filter[0];
      return { range: `${firstDigit}00-${firstDigit}99` };
    }
    
    // Partial range (e.g., "20x")
    if (/^\d{2}x$/.test(filter)) {
      const firstTwo = filter.substring(0, 2);
      return { range: `${firstTwo}0-${firstTwo}9` };
    }
    
    // Partial range (e.g., "2x1")
    if (/^[1-5]x\d$/.test(filter)) {
      const firstDigit = filter[0];
      const lastDigit = filter[2];
      return { range: `${firstDigit}${lastDigit}0-${firstDigit}${lastDigit}9` };
    }
    
    // Partial range (e.g., "x01")
    if (/^x\d{2}$/.test(filter)) {
      const lastTwo = filter.substring(1);
      return { range: `100-599`.filter(code => code.endsWith(lastTwo)) };
    }
    
    return null;
  },

  // Generate HTTP dog image URL
  getDogImage: (code) => {
    return `https://http.dog/${code}.jpg`;
  },

  // Show alert message
  showAlert: (element, message, isError = true) => {
    element.textContent = message;
    element.classList.remove('hidden');
    if (isError) {
      element.classList.add('alert-error');
      element.classList.remove('alert-success');
    } else {
      element.classList.add('alert-success');
      element.classList.remove('alert-error');
    }
    setTimeout(() => {
      element.classList.add('hidden');
    }, 3000);
  },

  // Format date
  formatDate: (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
};