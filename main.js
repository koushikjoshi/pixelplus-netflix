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

  // Initialize Netflix-style carousel with infinite scrolling
  initializeCarousel();

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

/**
 * Initialize the Netflix-style carousel with infinite scrolling
 * Uses cloned cards to create the illusion of infinite scrolling
 */
function initializeCarousel() {
  // Get carousel elements
  const carouselContainer = document.querySelector('.carousel-container');
  const carouselCards = document.querySelector('.carousel-cards');
  const carouselChevronRight = document.querySelector('.carousel-chevron-right');
  const carouselChevronLeft = document.querySelector('.carousel-chevron-left');
  const indicators = document.querySelectorAll('.carousel-indicators .indicator');
  
  // Exit if any required element is missing
  if (!carouselCards || !carouselChevronRight || !carouselChevronLeft) return;
  
  // Carousel state
  let isInitialView = true;
  let isScrolling = false;
  let hasInteracted = false; // Track if user has interacted with carousel
  let currentSetIndex = 0;
  let cardWidth = 0;
  let cardsPerSet = 6; // Default cards per set
  let totalSets = 0;
  let setWidth = 0;
  let containerWidth = 0;
  const initialPadding = 60; // Initial padding-left value
  const partialCardWidth = 0.2; // Show ~20% of adjacent cards for a more natural look
  
  // Make sure carousel container has overflow hidden to prevent artifacts
  if (carouselContainer) {
    carouselContainer.style.overflowX = 'hidden';
  }
  
  // Fix for black artifact - ensure parent has proper overflow
  const carouselSection = document.querySelector('.carousel');
  if (carouselSection) {
    carouselSection.style.overflow = 'hidden';
  }
  
  // Store the initial position for reference
  let initialPosition = 0;
  
  // 1. Calculate card dimensions and prepare infinite scroll
  function initializeCarouselDimensions() {
    // Get all cards and calculate dimensions
    const cards = document.querySelectorAll('.carousel-cards .card');
    if (cards.length < 2) return;
    
    // Calculate card width including gap by measuring distance between cards
    const firstCardRect = cards[0].getBoundingClientRect();
    const secondCardRect = cards[1].getBoundingClientRect();
    const gap = secondCardRect.left - (firstCardRect.left + firstCardRect.width);
    cardWidth = firstCardRect.width + gap;
    
    const totalCards = cards.length;
    totalSets = Math.ceil(totalCards / cardsPerSet);
    setWidth = cardsPerSet * cardWidth;
    
    // Get container width for calculations
    containerWidth = carouselContainer ? carouselContainer.clientWidth : document.querySelector('.carousel').clientWidth;
    
    console.log('Carousel initialized with dimensions:', {
      cardWidth,
      cardsPerSet,
      totalCards,
      totalSets,
      setWidth,
      containerWidth,
      initialPadding
    });
    
    // 2. Create clones for infinite scrolling
    setupInfiniteScrolling(cards);
  }
  
  // Setup infinite scrolling by cloning first and last sets
  function setupInfiniteScrolling(cards) {
    // Get sets of cards for cloning
    const originalCards = Array.from(cards);
    
    // Clear any existing clones
    document.querySelectorAll('.carousel-cards .card.clone').forEach(clone => {
      clone.remove();
    });
    
    // Create sufficient clones for smooth infinite scrolling
    // Clone multiple sets to ensure we have enough cards in both directions
    for (let i = 0; i < 2; i++) {
      // Clone first set of cards and append to end
      for (let j = 0; j < cardsPerSet; j++) {
        if (j < originalCards.length) {
          const clone = originalCards[j].cloneNode(true);
          clone.classList.add('clone', 'clone-end');
          carouselCards.appendChild(clone);
        }
      }
      
      // Clone last set of cards and prepend to beginning
      for (let j = originalCards.length - 1; j >= Math.max(0, originalCards.length - cardsPerSet); j--) {
        const clone = originalCards[j].cloneNode(true);
        clone.classList.add('clone', 'clone-start');
        carouselCards.prepend(clone);
      }
    }
    
    // Position the carousel to show the first real set (not clones)
    resetCarouselPosition();
  }
  
  // Position the carousel to the first real set of cards (after cloned last set)
  function resetCarouselPosition() {
    // Disable smooth scrolling temporarily for immediate positioning
    carouselCards.style.scrollBehavior = 'auto';
    
    // Calculate the initial position - after the cloned sets at the beginning
    const cloneSetsBefore = document.querySelectorAll('.carousel-cards .card.clone-start').length / cardsPerSet;
    initialPosition = cloneSetsBefore * setWidth;
    carouselCards.scrollLeft = initialPosition;
    
    // In the initial state, hide the partially visible card that appears before the first card
    if (isInitialView) {
      // This is the card immediately before the visible first card (last card of cloned last set)
      const clonedCards = document.querySelectorAll('.carousel-cards .card.clone-start');
      if (clonedCards.length > 0) {
        // Get the last clone-start card (should be the one right before the first visible card)
        const lastCloneStartCard = clonedCards[clonedCards.length - 1];
        lastCloneStartCard.classList.add('initially-hidden');
        
        // Add CSS rule for initially-hidden class if it doesn't exist
        if (!document.getElementById('carousel-initial-styles')) {
          const style = document.createElement('style');
          style.id = 'carousel-initial-styles';
          style.textContent = `
            .carousel-cards .card.initially-hidden {
              opacity: 0;
              pointer-events: none;
              user-select: none;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }
    
    // Re-enable smooth scrolling after a small delay
    setTimeout(() => {
      carouselCards.style.scrollBehavior = 'smooth';
    }, 10);
  }
  
  // 3. Update chevron visibility and styles
  function updateChevronVisibility() {
    // Left chevron is hidden initially
    if (isInitialView) {
      carouselChevronLeft.classList.add('hidden');
    } else {
      carouselChevronLeft.classList.remove('hidden');
    }
    
    // Always use carousel container for hover (wider area than just cards)
    const container = carouselContainer || carouselCards.parentElement || carouselCards;
    
    // Remove any existing mouseenter/mouseleave event listeners
    const oldMouseEnter = container._mouseenterHandler;
    const oldMouseLeave = container._mouseleaveHandler;
    
    if (oldMouseEnter) {
      container.removeEventListener('mouseenter', oldMouseEnter);
    }
    
    if (oldMouseLeave) {
      container.removeEventListener('mouseleave', oldMouseLeave);
    }
    
    // Create new hover event listeners
    const newMouseEnter = () => {
      // For right chevron, show the arrow on hover
      carouselChevronRight.classList.add('visible-hover');
      
      // For left chevron, show the arrow on hover if user has interacted with carousel
      if (hasInteracted) {
        carouselChevronLeft.classList.add('visible-hover');
      }
      
      // Only affect the arrow (::after) by adding a class that will be styled in CSS
      // Container remains visible at all times
    };
    
    const newMouseLeave = () => {
      // Hide the arrows on mouse leave
      carouselChevronRight.classList.remove('visible-hover');
      carouselChevronLeft.classList.remove('visible-hover');
    };
    
    // Store the handlers for future removal
    container._mouseenterHandler = newMouseEnter;
    container._mouseleaveHandler = newMouseLeave;
    
    // Make sure the right chevron gradient is not hidden initially
    carouselChevronRight.classList.remove('hidden');
    
    // Add the new event listeners
    container.addEventListener('mouseenter', newMouseEnter);
    container.addEventListener('mouseleave', newMouseLeave);
    
    // Add a class to carousel container to help with styling hover effects
    container.classList.add('hover-enabled');
    
    // Initialize chevron styles
    const style = document.createElement('style');
    style.id = 'carousel-chevron-styles';
    style.textContent = `
      .carousel-chevron-left::after, 
      .carousel-chevron-right::after {
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .carousel-chevron-left.visible-hover::after, 
      .carousel-chevron-right.visible-hover::after {
        opacity: 1;
      }
      
      .carousel-chevron-left.hidden {
        display: none;
      }
      
      /* Ensure chevrons are clickable */
      .carousel-container {
        position: relative;
      }
    `;
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById('carousel-chevron-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  }
  
  // 4. Update indicators to show current set
  function updateIndicators() {
    indicators.forEach((indicator, index) => {
      if (index === currentSetIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
  
  // 5. Handle first click special case - show left chevron but keep position style
  function handleFirstScrollClick() {
    if (isInitialView) {
      isInitialView = false;
      updateChevronVisibility();
      
      // Fix for black artifact - ensure width is updated properly
      carouselCards.style.width = '100%';
      
      // Show the initially hidden card when first interaction happens
      const hiddenCard = document.querySelector('.carousel-cards .card.initially-hidden');
      if (hiddenCard) {
        hiddenCard.classList.remove('initially-hidden');
      }
    }
  }
  
  // 6. Scroll to a specific set while maintaining initial position style
  function scrollToSet(setIndex, animate = true) {
    if (isScrolling) return;
    isScrolling = true;
    
    // Safety check - normalize setIndex if it's outside bounds
    if (setIndex < 0) setIndex = totalSets - 1;
    if (setIndex >= totalSets) setIndex = 0;
    
    // Determine if we're at a boundary case (from first to last, or last to first)
    const isBoundaryCase = (currentSetIndex === 0 && setIndex === totalSets - 1) || 
                           (currentSetIndex === totalSets - 1 && setIndex === 0);
                           
    // Calculate the direction of movement (1 for right, -1 for left)
    const direction = isBoundaryCase ? 
                     (setIndex === 0 ? 1 : -1) : // Explicit direction for boundary cases
                     (setIndex > currentSetIndex ? 1 : -1); // Normal direction
    
    // Store current index before updating
    const prevIndex = currentSetIndex;
    
    // Update current set index and indicators
    currentSetIndex = setIndex;
    updateIndicators();
    
    // User has interacted with the carousel
    hasInteracted = true;
    updateChevronVisibility();
    
    // Determine target position based on direction and special cases
    let targetScroll;
    
    if (isBoundaryCase) {
      if (direction === 1) {
        // Last set to first set - go forward to cloned first set
        targetScroll = initialPosition + (totalSets * setWidth);
        console.log("Going from last set to first - forward direction");
      } else {
        // First set to last set - go backward to cloned last set
        targetScroll = initialPosition - setWidth;
        console.log("Going from first set to last - backward direction");
      }
    } else {
      // Standard position for normal transitions
      targetScroll = initialPosition + (setIndex * setWidth);
    }
    
    // Perform the scroll with animation
    carouselCards.style.scrollBehavior = animate ? 'smooth' : 'auto';
    carouselCards.scrollLeft = targetScroll;
    
    // After scrolling completes, reset position if needed
    setTimeout(() => {
      try {
        // Only reset position if we were at a boundary case
        if (isBoundaryCase) {
          // Disable animation temporarily
          carouselCards.style.scrollBehavior = 'auto';
          
          // Reset to the actual position without animation
          if (setIndex === 0) {
            // Reset to actual first set
            carouselCards.scrollLeft = initialPosition;
            console.log("Reset to actual first set");
          } else {
            // Reset to actual last set
            carouselCards.scrollLeft = initialPosition + ((totalSets - 1) * setWidth);
            console.log("Reset to actual last set");
          }
          
          // Re-enable smooth scrolling after reset
          setTimeout(() => {
            carouselCards.style.scrollBehavior = 'smooth';
          }, 50);
        }
      } catch (error) {
        console.error("Error during carousel reset:", error);
      } finally {
        // Always ensure isScrolling is reset
        isScrolling = false;
      }
    }, animate ? 600 : 10);
  }
  
  // Check if we're at boundaries and reset position if needed
  function checkAndResetPosition() {
    const currentScroll = carouselCards.scrollLeft;
    
    // If we're at the beginning or end, reset to maintain infinite scrolling
    if (currentScroll <= initialPosition - setWidth) {
      // We're too far left, reset position
      carouselCards.style.scrollBehavior = 'auto';
      carouselCards.scrollLeft = initialPosition + ((totalSets - 1) * setWidth);
      setTimeout(() => {
        carouselCards.style.scrollBehavior = 'smooth';
      }, 10);
    } else if (currentScroll >= initialPosition + (totalSets * setWidth)) {
      // We're too far right, reset position
      carouselCards.style.scrollBehavior = 'auto';
      carouselCards.scrollLeft = initialPosition;
      setTimeout(() => {
        carouselCards.style.scrollBehavior = 'smooth';
      }, 10);
    }
  }
  
  // 7. Handle infinite scroll behavior
  function handleInfiniteScroll() {
    carouselCards.addEventListener('scroll', () => {
      if (isScrolling) return;
      
      const scrollPosition = carouselCards.scrollLeft;
      
      // Use small threshold to determine if we need to start checking for reset
      if (Math.abs(scrollPosition - (initialPosition + (currentSetIndex * setWidth))) > setWidth / 2) {
        // Calculate which set we're currently viewing
        const tempIndex = Math.round((scrollPosition - initialPosition) / setWidth);
        
        // Check if we need to update the current set index
        if (tempIndex >= 0 && tempIndex < totalSets && tempIndex !== currentSetIndex) {
          currentSetIndex = tempIndex;
          updateIndicators();
        }
        
        // Check if we need to reset position
        checkAndResetPosition();
      }
    });
  }
  
  // 8. Chevron click handlers
  function setupChevronHandlers() {
    // Right chevron - go to next set
    carouselChevronRight.addEventListener('click', () => {
      if (isScrolling) return;
      
      if (isInitialView) {
        handleFirstScrollClick();
      }
      
      scrollToSet(currentSetIndex + 1);
    });
    
    // Left chevron - go to previous set
    carouselChevronLeft.addEventListener('click', () => {
      if (isScrolling) return;
      scrollToSet(currentSetIndex - 1);
    });
  }
  
  // 9. Indicator click handlers
  function setupIndicatorHandlers() {
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        if (isScrolling) return;
        
        if (isInitialView) {
          handleFirstScrollClick();
        }
        
        scrollToSet(index);
      });
    });
  }
  
  // 10. Optional: Drag functionality
  function setupDragFunctionality() {
    let isDragging = false;
    let startPosition = 0;
    let startScrollLeft = 0;
    let animationFrameId = null;
    
    function startDrag(e) {
      isDragging = true;
      startPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      startScrollLeft = carouselCards.scrollLeft;
      carouselCards.style.scrollBehavior = 'auto';
      
      // Handle initial state adjustment on drag
      if (isInitialView) {
        handleFirstScrollClick();
      }
    }
    
    function duringDrag(e) {
      if (!isDragging) return;
      e.preventDefault();
      
      const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const diff = startPosition - currentPosition;
      
      // Use requestAnimationFrame for smoother scrolling
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        carouselCards.scrollLeft = startScrollLeft + diff;
      });
    }
    
    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      
      // Snap to nearest set using the same position reference
      const scrollPosition = carouselCards.scrollLeft;
      const nearestSetIndex = Math.round((scrollPosition - initialPosition) / setWidth);
      
      if (nearestSetIndex >= 0 && nearestSetIndex < totalSets) {
        scrollToSet(nearestSetIndex);
      } else if (nearestSetIndex < 0) {
        scrollToSet(0);
      } else {
        scrollToSet(totalSets - 1);
      }
      
      carouselCards.style.scrollBehavior = 'smooth';
    }
    
    // Mouse events
    carouselCards.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', duringDrag);
    window.addEventListener('mouseup', endDrag);
    
    // Touch events
    carouselCards.addEventListener('touchstart', startDrag);
    window.addEventListener('touchmove', duringDrag, { passive: false });
    window.addEventListener('touchend', endDrag);
  }
  
  // 11. Window resize handler
  function setupResizeHandler() {
    window.addEventListener('resize', () => {
      // Recalculate dimensions on window resize
      const cards = document.querySelectorAll('.carousel-cards .card:not(.clone)');
      if (cards.length < 2) return;
      
      // Recalculate card width
      const firstCardRect = cards[0].getBoundingClientRect();
      const secondCardRect = cards[1].getBoundingClientRect();
      const gap = secondCardRect.left - (firstCardRect.left + firstCardRect.width);
      cardWidth = firstCardRect.width + gap;
      
      // Update setWidth and container width
      setWidth = cardsPerSet * cardWidth;
      containerWidth = carouselContainer ? carouselContainer.clientWidth : document.querySelector('.carousel').clientWidth;
      
      // Reposition to current set while maintaining position style
      carouselCards.style.scrollBehavior = 'auto';
      carouselCards.scrollLeft = initialPosition + (currentSetIndex * setWidth);
      
      setTimeout(() => {
        carouselCards.style.scrollBehavior = 'smooth';
      }, 10);
    });
  }
  
  // 12. Initialize everything
  function initialize() {
    initializeCarouselDimensions();
    updateChevronVisibility();
    updateIndicators();
    setupChevronHandlers();
    setupIndicatorHandlers();
    handleInfiniteScroll();
    setupDragFunctionality();
    setupResizeHandler();
  }
  
  // Start initialization after a short delay to ensure DOM is fully loaded
  setTimeout(initialize, 100);
}
