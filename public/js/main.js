/**
 * Main JavaScript file for Ultimate Frisbee Scorigami
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Add active class to current nav item
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Add event listener for chart download buttons
  const downloadButtons = document.querySelectorAll('.download-chart');
  downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
      const canvasId = this.getAttribute('data-canvas');
      const canvas = document.getElementById(canvasId);
      
      if (canvas) {
        // Create a temporary link
        const link = document.createElement('a');
        link.download = `${canvasId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    });
  });

  // Handle errors gracefully
  window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.message);
    
    // Display error message to user if appropriate
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> ${e.message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    }
  });
});

/**
 * Format a number with commas as thousands separators
 * 
 * @param {number} num - The number to format
 * @returns {string} - The formatted number
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a date string in a more readable format
 * 
 * @param {string} dateStr - The date string in YYYY-MM-DD format
 * @returns {string} - The formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
