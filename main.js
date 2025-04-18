/**
 * Netflix clone main JavaScript
 * Handles navigation and interaction
 */

document.addEventListener('DOMContentLoaded', () => {
  // Add scroll event to handle navigation appearance changes
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    const scrollThreshold = 100; // Threshold for complete transition
    
    if (window.scrollY > 0) {
      // Any scroll - start transition to black based on scroll position
      const opacity = Math.min(window.scrollY / scrollThreshold, 1);
      
      if (opacity >= 1) {
        // Fully scrolled - apply scrolled class for solid background
        nav.classList.add('scrolled');
      } else {
        // Transitioning - blend between gradient and solid
        nav.classList.remove('scrolled');
        nav.style.backgroundColor = `rgba(20, 20, 20, ${opacity})`;
      }
    } else {
      // At top - reset to default gradient with transparent background color
      nav.classList.remove('scrolled');
      nav.style.backgroundColor = 'transparent';
    }
  });

  // Search functionality
  const searchTab = document.querySelector('.searchTab');
  const searchBox = document.querySelector('.searchBox');
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.querySelector('.icon-close');
  
  // Position the searchBox to align with the searchTab
  function updateSearchBoxPosition() {
    const searchTabRect = searchTab.getBoundingClientRect();
    searchBox.style.right = `${document.body.clientWidth - searchTabRect.right}px`;
    
    // Adjust position based on screen width
    if (window.innerWidth <= 768) {
      searchBox.style.marginRight = '-42px';
    } else if (window.innerWidth <= 640) {
      searchBox.style.marginRight = '-32px';
    } else {
      searchBox.style.marginRight = '-52px';
    }
  }
  
  // Initial positioning
  updateSearchBoxPosition();
  
  // Update on resize
  window.addEventListener('resize', () => {
    updateSearchBoxPosition();
    // If search box is visible, ensure it stays correctly positioned
    if (!searchBox.classList.contains('hidden')) {
      // Small delay to ensure DOM has updated
      setTimeout(updateSearchBoxPosition, 10);
    }
  });

  // Toggle search box when search button is clicked
  searchTab.addEventListener('click', () => {
    updateSearchBoxPosition(); // Ensure correct positioning
    searchBox.classList.toggle('hidden');
    searchTab.classList.toggle('hidden');
    
    // If search box is now visible, focus the input
    if (!searchBox.classList.contains('hidden')) {
      searchInput.focus();
    }
  });

  // Clear input when clear button is clicked
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
  });

  // Close search box when clicking outside
  document.addEventListener('click', (event) => {
    const isClickInside = searchBox.contains(event.target) || searchTab.contains(event.target);
    
    if (!isClickInside && !searchBox.classList.contains('hidden')) {
      searchBox.classList.add('hidden');
      searchTab.classList.remove('hidden');
    }
  });

  // Show/hide clear button based on input content
  searchInput.addEventListener('input', () => {
    if (searchInput.value) {
      clearButton.classList.remove('empty');
    } else {
      clearButton.classList.add('empty');
    }
  });
  
  // Handle Escape key press to close search
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !searchBox.classList.contains('hidden')) {
      searchBox.classList.add('hidden');
      searchTab.classList.remove('hidden');
    }
  });
  
  // Mobile menu functionality
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      mobileMenuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('hidden');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      const isClickInsideMobileMenu = mobileMenu.contains(event.target) || mobileMenuToggle.contains(event.target);
      
      if (!isClickInsideMobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.classList.remove('active');
      }
    });
    
    // Close mobile menu when ESC key is pressed
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.classList.remove('active');
      }
    });
    
    // Close mobile menu on window resize to desktop size
    window.addEventListener('resize', () => {
      if (window.innerWidth > 960 && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.classList.remove('active');
      }
    });
  }
});
