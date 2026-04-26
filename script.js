// App State
let currentScreen = 'homeScreen';
let posts = [];
let products = [];
let reportStep = 1;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    showSplashScreen();
});

function showSplashScreen() {
    // Show splash screen for 3 seconds
    setTimeout(() => {
        const splashScreen = document.getElementById('splashScreen');
        splashScreen.classList.add('hidden');
        
        // Initialize app after splash screen
        setTimeout(() => {
            initializeApp();
            loadPosts();
            loadProducts();
            setupEventListeners();
            loadThemePreference();
        }, 500);
    }, 3000);
}

function initializeApp() {
    // Show home screen by default
    showScreen('homeScreen');
    
    // Add smooth animations
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
}

// Theme Toggle Functions
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.classList.contains('light-mode')) {
        // Switch to dark mode
        body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
        showNotification('Dark mode activated 🌙');
    } else {
        // Switch to light mode
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
        showNotification('Light mode activated ☀️');
    }
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

function setupEventListeners() {
    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            showScreen(screenId);
            updateActiveNav(this);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            updateActiveFilter(this);
            handleFilter(this.getAttribute('data-filter'));
        });
    });

    // Category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            updateActiveCategory(this);
            filterProducts(this.textContent);
        });
    });

    // Add ripple effect to buttons
    addRippleEffect();
}

function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show selected screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        
        // Add entrance animation
        targetScreen.style.transform = 'translateY(20px)';
        targetScreen.style.opacity = '0';
        setTimeout(() => {
            targetScreen.style.transition = 'all 0.3s ease';
            targetScreen.style.transform = 'translateY(0)';
            targetScreen.style.opacity = '1';
        }, 50);
    }
}

function updateActiveNav(activeItem) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

function updateActiveFilter(activeBtn) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function updateActiveCategory(activeBtn) {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Load Posts Data
function loadPosts() {
    posts = [
        {
            id: 1,
            user: {
                name: 'Sarah Johnson',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
                location: 'Central Park, NYC'
            },
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
            caption: 'Amazing beach cleanup today! Collected over 50kg of plastic waste with our amazing volunteers. Every small action counts! 🌊♻️ #BeachCleanup #SaveOurOceans',
            likes: 234,
            liked: false,
            comments: 18,
            timestamp: '2 hours ago'
        },
        {
            id: 2,
            user: {
                name: 'Mike Chen',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                location: 'Golden Gate Park, SF'
            },
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
            caption: 'Found this illegal dumping site during my morning jog. Already reported through the app! The AI detected it as mixed waste with high priority. Let\'s keep our neighborhoods clean! 💚',
            likes: 156,
            liked: true,
            comments: 12,
            timestamp: '4 hours ago'
        },
        {
            id: 3,
            user: {
                name: 'Emma Wilson',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                location: 'Riverside Park, LA'
            },
            image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=400&fit=crop',
            caption: 'Planted 20 native trees today with the local environmental group! 🌳 These will help absorb CO2 and provide habitat for wildlife. Who wants to join our next planting event?',
            likes: 189,
            liked: false,
            comments: 25,
            timestamp: '6 hours ago'
        }
    ];

    renderPosts();
}

function renderPosts() {
    const postsFeed = document.getElementById('postsFeed');
    if (!postsFeed) return;

    postsFeed.innerHTML = posts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.user.avatar}" alt="${post.user.name}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.user.name}</h4>
                    <p class="post-location">📍 ${post.user.location}</p>
                </div>
            </div>
            <img src="${post.image}" alt="Post image" class="post-image" ondblclick="toggleLike(${post.id})">
            <div class="post-actions">
                <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn" onclick="openComments(${post.id})">
                    <i class="fas fa-comment"></i>
                </button>
                <button class="action-btn" onclick="sharePost(${post.id})">
                    <i class="fas fa-share"></i>
                </button>
            </div>
            <div class="post-likes">${post.likes.toLocaleString()} likes</div>
            <div class="post-caption">
                <span class="post-username">${post.user.name}</span>
                ${post.caption}
            </div>
        </div>
    `).join('');
}

// Load Products Data
function loadProducts() {
    products = [
        {
            id: 1,
            name: 'Bamboo Water Bottle',
            price: 150,
            category: 'Reusable',
            image: '🥤',
            description: 'Eco-friendly bamboo water bottle',
            rating: 4.8,
            popular: true
        },
        {
            id: 2,
            name: 'Organic Cotton Tote',
            price: 80,
            category: 'Organic',
            image: '👜',
            description: 'Sustainable cotton shopping bag',
            rating: 4.7,
            popular: false
        },
        {
            id: 3,
            name: 'Solar Power Bank',
            price: 300,
            category: 'Eco Home',
            image: '🔋',
            description: 'Solar-powered portable charger',
            rating: 4.9,
            popular: true
        },
        {
            id: 4,
            name: 'Reusable Food Wraps',
            price: 60,
            category: 'Reusable',
            image: '🥪',
            description: 'Beeswax food storage wraps',
            rating: 4.6,
            popular: false
        },
        {
            id: 5,
            name: 'Bamboo Toothbrush Set',
            price: 45,
            category: 'Organic',
            image: '🪥',
            description: 'Set of 4 bamboo toothbrushes',
            rating: 4.5,
            popular: false
        },
        {
            id: 6,
            name: 'LED Smart Bulbs',
            price: 120,
            category: 'Eco Home',
            image: '💡',
            description: 'Energy-efficient smart lighting',
            rating: 4.8,
            popular: true
        },
        {
            id: 7,
            name: 'Compost Bin',
            price: 200,
            category: 'Eco Home',
            image: '🗂️',
            description: 'Indoor composting solution',
            rating: 4.4,
            popular: false
        },
        {
            id: 8,
            name: 'Eco Cleaning Kit',
            price: 90,
            category: 'Reusable',
            image: '🧽',
            description: 'Natural cleaning supplies bundle',
            rating: 4.7,
            popular: true
        }
    ];

    renderProducts();
}

function renderProducts(filteredProducts = products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div class="product-image">${product.image}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-rating">
                ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}
            </div>
            <div class="product-price">🍃 ${product.price} points</div>
            ${product.popular ? '<div class="popular-badge">🔥 Popular</div>' : ''}
        </div>
    `).join('');
}

// Interactive Functions
function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        // Add heart animation
        if (post.liked) {
            showHeartAnimation();
        }
        
        renderPosts();
    }
}

function showHeartAnimation() {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 60px;
        z-index: 1000;
        pointer-events: none;
        animation: heartPop 0.8s ease;
    `;
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        document.body.removeChild(heart);
    }, 800);
}

function openComments(postId) {
    // Simulate opening comments
    showNotification('Comments feature coming soon!');
}

function sharePost(postId) {
    // Simulate sharing
    showNotification('Post shared successfully!');
}

function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        showNotification(`Viewing ${product.name} - ${product.price} points`);
    }
}

function viewStory(username) {
    showNotification(`Viewing ${username}'s story`);
    // Here you would implement story viewing functionality
    // For now, just show a notification
}

function filterProducts(category) {
    if (category === 'All') {
        renderProducts();
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Camera and Report Functions
function openCamera() {
    const modal = document.getElementById('cameraModal');
    modal.classList.add('active');
    
    // Reset to first step
    showCreationStep('photoStep');
    resetPostForm();
}

function captureNewPhoto() {
    // Simulate photo capture
    showNotification('Camera feature would open here');
    simulatePhotoSelected();
}

function uploadNewPhoto() {
    // Simulate photo upload
    showNotification('Gallery feature would open here');
    simulatePhotoSelected();
}

function simulatePhotoSelected() {
    // Simulate photo selection and move to details step
    const preview = document.getElementById('cameraPreview');
    preview.innerHTML = `
        <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=300&fit=crop" alt="Selected photo">
    `;
    preview.classList.add('has-image');
    
    // Update preview in details step
    const previewImage = document.querySelector('#previewImage img');
    previewImage.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&h=120&fit=crop';
    previewImage.style.display = 'block';
    document.querySelector('.placeholder-preview').style.display = 'none';
    
    // Move to details step
    setTimeout(() => {
        showCreationStep('detailsStep');
    }, 1000);
}

function showCreationStep(stepId) {
    // Hide all steps
    const steps = document.querySelectorAll('.creation-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Show selected step
    document.getElementById(stepId).classList.add('active');
    
    // Update share button state
    const shareBtn = document.querySelector('.share-btn');
    if (stepId === 'detailsStep') {
        shareBtn.disabled = false;
    } else {
        shareBtn.disabled = true;
    }
}

function resetPostForm() {
    // Reset form fields
    document.getElementById('postCaption').value = '';
    document.getElementById('locationInput').value = '';
    document.getElementById('captionCount').textContent = '0';
    
    // Reset preview
    const preview = document.getElementById('cameraPreview');
    preview.innerHTML = `
        <i class="fas fa-camera camera-icon"></i>
        <p>Tap to capture or upload image</p>
    `;
    preview.classList.remove('has-image');
    
    // Reset details preview
    const previewImage = document.querySelector('#previewImage img');
    previewImage.style.display = 'none';
    document.querySelector('.placeholder-preview').style.display = 'flex';
}

function shareNewPost() {
    const caption = document.getElementById('postCaption').value;
    const location = document.getElementById('locationInput').value;
    
    if (!caption.trim()) {
        showNotification('Please add a caption to your post');
        return;
    }
    
    // Simulate post creation
    showNotification('Post shared successfully! 🎉');
    closeModal('cameraModal');
    
    // Add new post to feed (simulate)
    addNewPostToFeed(caption, location);
}

function addNewPostToFeed(caption, location) {
    const newPost = {
        id: posts.length + 1,
        user: {
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            location: location || 'Current Location'
        },
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
        caption: caption,
        likes: 0,
        liked: false,
        comments: 0,
        timestamp: 'Just now'
    };
    
    posts.unshift(newPost);
    renderPosts();
}

function getCurrentLocation() {
    showNotification('Getting current location...');
    setTimeout(() => {
        document.getElementById('locationInput').value = 'Central Park, NYC';
        showNotification('Location updated');
    }, 1500);
}

function selectLocation(location) {
    document.getElementById('locationInput').value = location;
    showNotification(`Location set to ${location}`);
}

// Caption counter
document.addEventListener('DOMContentLoaded', function() {
    const captionInput = document.getElementById('postCaption');
    if (captionInput) {
        captionInput.addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('captionCount').textContent = count;
            
            // Change color when approaching limit
            const counter = document.getElementById('captionCount');
            if (count > 450) {
                counter.style.color = '#e74c3c';
            } else if (count > 400) {
                counter.style.color = '#f39c12';
            } else {
                counter.style.color = '#888';
            }
        });
    }
});

function capturePhoto() {
    showNotification('Camera feature would open here');
    nextReportStep();
}

function uploadPhoto() {
    showNotification('Gallery feature would open here');
    nextReportStep();
}

function nextReportStep() {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    
    reportStep++;
    if (reportStep <= 3) {
        const nextStep = document.getElementById(`step${reportStep}`);
        if (nextStep) {
            nextStep.classList.add('active');
        }
    }
    
    if (reportStep === 2) {
        // Simulate AI analysis
        setTimeout(() => {
            nextReportStep();
        }, 3000);
    }
}

function submitReport() {
    showNotification('Report submitted successfully! 🎉');
    reportStep = 1;
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
}

// Search and Filter Functions
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const results = document.getElementById('searchResults');
    const suggestions = results.querySelector('.search-suggestions');
    
    if (query.length > 0) {
        // Hide default suggestions and show search results
        suggestions.style.display = 'none';
        
        // Simulate user search results based on query
        const searchResults = generateUserSearchResults(query);
        results.innerHTML = searchResults;
    } else {
        // Show default suggestions
        suggestions.style.display = 'block';
        results.innerHTML = `
            <div class="search-suggestions">
                <div class="suggestion-section">
                    <h4>👥 Suggested Users</h4>
                    <div class="suggestion-item" onclick="selectUser('Sarah Johnson')">
                        <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face" alt="Sarah" class="suggestion-avatar">
                        <div>
                            <div class="suggestion-title">Sarah Johnson</div>
                            <div class="suggestion-subtitle">Environmental Advocate • 1.2k followers</div>
                        </div>
                        <div class="follow-btn">Follow</div>
                    </div>
                    <div class="suggestion-item" onclick="selectUser('Mike Chen')">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" alt="Mike" class="suggestion-avatar">
                        <div>
                            <div class="suggestion-title">Mike Chen</div>
                            <div class="suggestion-subtitle">Cleanup Organizer • 890 followers</div>
                        </div>
                        <div class="follow-btn">Follow</div>
                    </div>
                    <div class="suggestion-item" onclick="selectUser('Emma Wilson')">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face" alt="Emma" class="suggestion-avatar">
                        <div>
                            <div class="suggestion-title">Emma Wilson</div>
                            <div class="suggestion-subtitle">Tree Planting Expert • 654 followers</div>
                        </div>
                        <div class="follow-btn">Follow</div>
                    </div>
                    <div class="suggestion-item" onclick="selectUser('Alex Rodriguez')">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face" alt="Alex" class="suggestion-avatar">
                        <div>
                            <div class="suggestion-title">Alex Rodriguez</div>
                            <div class="suggestion-subtitle">Ocean Cleanup Volunteer • 432 followers</div>
                        </div>
                        <div class="follow-btn">Follow</div>
                    </div>
                    <div class="suggestion-item" onclick="selectUser('Lisa Park')">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face" alt="Lisa" class="suggestion-avatar">
                        <div>
                            <div class="suggestion-title">Lisa Park</div>
                            <div class="suggestion-subtitle">Recycling Advocate • 789 followers</div>
                        </div>
                        <div class="follow-btn">Follow</div>
                    </div>
                    <div class="suggestion-item" onclick="selectUser('David Kim')">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face" alt="David" class="suggestion-avatar">
                        <div>
                            <div class="suggestion-title">David Kim</div>
                            <div class="suggestion-subtitle">Green Energy Enthusiast • 567 followers</div>
                        </div>
                        <div class="follow-btn">Follow</div>
                    </div>
                </div>
            </div>
        `;
    }
}

function generateUserSearchResults(query) {
    const allUsers = [
        { name: 'Sarah Johnson', subtitle: 'Environmental Advocate • 1.2k followers', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
        { name: 'Mike Chen', subtitle: 'Cleanup Organizer • 890 followers', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
        { name: 'Emma Wilson', subtitle: 'Tree Planting Expert • 654 followers', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
        { name: 'Alex Rodriguez', subtitle: 'Ocean Cleanup Volunteer • 432 followers', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
        { name: 'Lisa Park', subtitle: 'Recycling Advocate • 789 followers', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face' },
        { name: 'David Kim', subtitle: 'Green Energy Enthusiast • 567 followers', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' },
        { name: 'Maria Garcia', subtitle: 'Sustainability Expert • 1.5k followers', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop&crop=face' },
        { name: 'James Wilson', subtitle: 'Climate Activist • 923 followers', avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=50&h=50&fit=crop&crop=face' },
    ];

    const matchingUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(query) || user.subtitle.toLowerCase().includes(query)
    );

    let html = '<div class="search-results-content">';
    
    if (matchingUsers.length > 0) {
        html += '<div class="suggestion-section"><h4>👥 Search Results</h4>';
        matchingUsers.forEach(user => {
            html += `
                <div class="suggestion-item" onclick="selectUser('${user.name}')">
                    <img src="${user.avatar}" alt="${user.name}" class="suggestion-avatar">
                    <div>
                        <div class="suggestion-title">${user.name}</div>
                        <div class="suggestion-subtitle">${user.subtitle}</div>
                    </div>
                    <div class="follow-btn">Follow</div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        html += `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-title">No users found</div>
                <div class="no-results-subtitle">Try searching for different names or keywords</div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

function switchSearchTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    const tabContents = document.querySelectorAll('.search-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function selectUser(username) {
    showNotification(`Viewing ${username}'s profile`);
}

function showMarkerInfo(markerId) {
    const markerInfo = {
        'cleanup1': 'Beach Cleanup Drive - Tomorrow 9:00 AM',
        'cleanup2': 'Tree Planting Event - Sunday 8:00 AM',
        'issue1': 'Plastic Waste Overflow - High Priority',
        'issue2': 'Illegal Dumping Site - Medium Priority'
    };
    
    showNotification(markerInfo[markerId] || 'Location info');
}

function handleFilter(filter) {
    showNotification(`Filtering by: ${filter}`);
}

// Modal Functions
function openNotifications() {
    const modal = document.getElementById('notificationModal');
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #2ECC71, #27AE60);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        z-index: 1001;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(46, 204, 113, 0.4);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function addRippleEffect() {
    const buttons = document.querySelectorAll('button, .nav-item, .post-card, .product-card');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(46, 204, 113, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes heartPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    }
    
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    @keyframes ripple {
        to { transform: scale(2); opacity: 0; }
    }
    
    .search-result-section {
        margin-bottom: 25px;
    }
    
    .search-result-section h4 {
        color: #2ECC71;
        margin-bottom: 15px;
        font-size: 16px;
    }
    
    .search-result-item {
        display: flex;
        align-items: center;
        padding: 15px;
        background: rgba(46, 204, 113, 0.1);
        border-radius: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .search-result-item:hover {
        background: rgba(46, 204, 113, 0.2);
        transform: translateX(5px);
    }
    
    .search-result-item img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 15px;
    }
    
    .result-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-right: 15px;
    }
    
    .result-name {
        font-weight: 600;
        margin-bottom: 2px;
    }
    
    .result-subtitle {
        font-size: 12px;
        color: #888;
    }
`;

document.head.appendChild(style);

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';