/**
 * NewsHub - JavaScript Application
 * Author: Internship Project
 * Description: Dynamic news website with API simulation
 */

// Global application variables
let currentCategory = 'general';
let currentView = 'grid';
let newsCache = {};
let allArticles = [];
let likedArticles = [];
let savedArticles = [];

/**
 * Initialize application when page loads
 */
window.onload = function() {
    console.log('NewsHub application starting...');
    loadNews('general');
    setupSearchHandler();
    setupEventListeners();
};

/**
 * Setup search functionality
 */
function setupSearchHandler() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchNews();
        }
    });
    
    // Add real-time search (optional)
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm.length > 2) {
            searchNews();
        } else if (searchTerm.length === 0) {
            displayNews(allArticles);
        }
    });
}

/**
 * Setup additional event listeners
 */
function setupEventListeners() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Clear search
            document.getElementById('search-input').value = '';
            displayNews(allArticles);
        }
    });
}

/**
 * Search through news articles
 */
function searchNews() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayNews(allArticles);
        updateNewsCounter(allArticles.length);
        return;
    }

    const filteredArticles = allArticles.filter(article => 
        article.title.toLowerCase().includes(searchTerm) ||
        article.description.toLowerCase().includes(searchTerm) ||
        article.category.toLowerCase().includes(searchTerm) ||
        article.source.toLowerCase().includes(searchTerm)
    );

    displayNews(filteredArticles);
    updateNewsCounter(filteredArticles.length);
    
    // Log search activity
    console.log(`Search performed: "${searchTerm}" - ${filteredArticles.length} results found`);
}

/**
 * Toggle between grid and list view
 */
function toggleView(view) {
    currentView = view;
    
    // Update toggle buttons appearance
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Re-display current articles with new view
    if (allArticles.length > 0) {
        displayNews(allArticles);
    }
    
    console.log(`View changed to: ${view}`);
}

/**
 * Update news counter display
 */
function updateNewsCounter(count) {
    const counterText = `Showing ${count} article${count !== 1 ? 's' : ''} in ${currentCategory}`;
    document.getElementById('news-counter').textContent = counterText;
}

/**
 * Update statistics in header
 */
function updateStats(articleCount) {
    document.getElementById('total-articles').textContent = articleCount;
    const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit'
    });
    document.getElementById('last-updated').textContent = currentTime;
}

/**
 * Show loading animation
 */
function showLoading() {
    document.getElementById('news-content').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading ${currentCategory} news...</p>
        </div>
    `;
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('news-content').innerHTML = `
        <div class="error-message">
            <h3>⚠️ Unable to Load News</h3>
            <p>${message}</p>
            <p>Please check your connection and try again.</p>
        </div>
    `;
}

/**
 * Update active category button
 */
function updateActiveButton(category) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Like article functionality
 */
function likeArticle(index) {
    const article = allArticles[index];
    const isLiked = likedArticles.includes(article.id);
    
    if (isLiked) {
        likedArticles = likedArticles.filter(id => id !== article.id);
    } else {
        likedArticles.push(article.id);
    }
    
    // Update button appearance
    const btn = document.querySelector(`[onclick="likeArticle(${index})"]`);
    if (btn) {
        btn.classList.toggle('liked');
        btn.textContent = isLiked ? '👍 Like' : '❤️ Liked';
    }
    
    console.log(`Article ${isLiked ? 'unliked' : 'liked'}: ${article.title}`);
}

/**
 * Save article functionality
 */
function saveArticle(index) {
    const article = allArticles[index];
    const isSaved = savedArticles.includes(article.id);
    
    if (isSaved) {
        savedArticles = savedArticles.filter(id => id !== article.id);
    } else {
        savedArticles.push(article.id);
    }
    
    // Update button appearance
    const btn = document.querySelector(`[onclick="saveArticle(${index})"]`);
    if (btn) {
        btn.classList.toggle('saved');
        btn.textContent = isSaved ? '📝 Save' : '✅ Saved';
    }
    
    console.log(`Article ${isSaved ? 'unsaved' : 'saved'}: ${article.title}`);
}

/**
 * Create HTML for a single news card
 */
function createNewsCard(article, index) {
    const isLiked = likedArticles.includes(article.id);
    const isSaved = savedArticles.includes(article.id);
    const viewClass = currentView === 'list' ? 'list-view' : '';
    
    return `
        <div class="news-card ${viewClass}">
            <img src="${article.image}" 
                 alt="News Image" 
                 class="news-image" 
                 onerror="this.src='https://picsum.photos/400/200?random=${Math.floor(Math.random() * 100)}'">
            <div class="news-content">
                <div class="category-tag">${article.category}</div>
                <div class="news-title" onclick="readArticle(${index})">${article.title}</div>
                <div class="news-description">${article.description}</div>
                <div class="news-actions">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="likeArticle(${index})">
                        ${isLiked ? '❤️ Liked' : '👍 Like'}
                    </button>
                    <button class="action-btn ${isSaved ? 'saved' : ''}" onclick="saveArticle(${index})">
                        ${isSaved ? '✅ Saved' : '📝 Save'}
                    </button>
                    <button class="action-btn" onclick="shareArticle(${index})">🔗 Share</button>
                </div>
                <div class="news-meta">
                    <span class="news-source">${article.source}</span>
                    <span class="news-date">${formatDate(article.date)}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Read full article (placeholder functionality)
 */
function readArticle(index) {
    const article = allArticles[index];
    
    // In a real application, this would open the article in a modal or new page
    const message = `Reading: ${article.title}\n\nDescription: ${article.description}\n\nThis would normally open the full article or redirect to the source.`;
    
    if (confirm(message + '\n\nWould you like to visit the source website?')) {
        // In real implementation, would open article.url
        console.log(`Would open article: ${article.title}`);
    }
}

/**
 * Share article functionality
 */
function shareArticle(index) {
    const article = allArticles[index];
    
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: article.title,
            text: article.description,
            url: window.location.href
        }).then(() => {
            console.log('Article shared successfully');
        }).catch((error) => {
            console.log('Error sharing article:', error);
            fallbackShare(article);
        });
    } else {
        fallbackShare(article);
    }
}

/**
 * Fallback share functionality for browsers without Web Share API
 */
function fallbackShare(article) {
    const shareText = `Check out this article: "${article.title}" - ${article.description}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Article information copied to clipboard!');
        }).catch(() => {
            promptShare(shareText);
        });
    } else {
        promptShare(shareText);
    }
}

/**
 * Prompt user to manually copy share text
 */
function promptShare(shareText) {
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('Article information copied to clipboard!');
    } catch (err) {
        alert('Unable to copy. Please manually copy the text from the prompt.');
        prompt('Copy this text:', shareText);
    }
    
    document.body.removeChild(textArea);
}

/**
 * Display news articles in the UI
 */
function displayNews(articles) {
    allArticles = articles;
    const containerClass = currentView === 'list' ? 'news-container list-view' : 'news-container';
    
    let newsHTML = `<div class="${containerClass}">`;
    
    if (articles.length === 0) {
        newsHTML = '<div class="error-message"><h3>No articles found</h3><p>Try searching with different keywords or select another category.</p></div>';
    } else {
        articles.forEach((article, index) => {
            newsHTML += createNewsCard(article, index);
        });
        newsHTML += '</div>';
    }
    
    document.getElementById('news-content').innerHTML = newsHTML;
    updateNewsCounter(articles.length);
    updateStats(articles.length);
    
    console.log(`Displayed ${articles.length} articles in ${currentView} view`);
}

/**
 * Get sample news data (simulates API response)
 * In a real application, this would be replaced with actual API calls
 */
function getSampleNews(category) {
    const sampleData = {
        general: [
            {
                id: 1,
                title: "Global Climate Summit Reaches Historic Agreement",
                description: "World leaders from 195 countries agree on ambitious new targets for carbon emissions reduction and renewable energy adoption, marking a significant step forward in combating climate change.",
                image: "https://picsum.photos/400/200?random=1",
                source: "Global News Network",
                date: "2025-07-23T10:00:00Z",
                category: "Environment"
            },
            {
                id: 2,
                title: "International Space Station Welcomes New Crew",
                description: "A diverse crew of astronauts from multiple countries arrives at the ISS for a six-month mission focusing on scientific research and technology demonstrations.",
                image: "https://picsum.photos/400/200?random=2",
                source: "Space Today",
                date: "2025-07-23T09:30:00Z",
                category: "Space"
            },
            {
                id: 3,
                title: "Economic Recovery Shows Strong Momentum",
                description: "Latest quarterly reports indicate robust economic growth across major markets, with unemployment rates reaching pre-pandemic levels in several regions.",
                image: "https://picsum.photos/400/200?random=3",
                source: "Economic Times",
                date: "2025-07-23T08:45:00Z",
                category: "Economy"
            }
        ],
        technology: [
            {
                id: 4,
                title: "Revolutionary AI Breakthrough in Medical Diagnosis",
                description: "New machine learning algorithms demonstrate 95% accuracy in early disease detection, potentially transforming healthcare delivery and patient outcomes worldwide.",
                image: "https://picsum.photos/400/200?random=4",
                source: "Tech Review",
                date: "2025-07-23T11:15:00Z",
                category: "AI & Healthcare"
            },
            {
                id: 5,
                title: "Quantum Computing Achieves New Milestone",
                description: "Scientists achieve quantum supremacy in solving complex optimization problems, opening doors to revolutionary advances in drug discovery and financial modeling.",
                image: "https://picsum.photos/400/200?random=5",
                source: "Quantum Today",
                date: "2025-07-23T10:30:00Z",
                category: "Quantum Tech"
            },
            {
                id: 6,
                title: "5G Network Expansion Accelerates Globally",
                description: "Major telecommunications companies announce massive infrastructure investments to expand 5G coverage to rural areas, promising to bridge the digital divide.",
                image: "https://picsum.photos/400/200?random=6",
                source: "Network World",
                date: "2025-07-23T09:00:00Z",
                category: "Telecommunications"
            }
        ],
        business: [
            {
                id: 7,
                title: "Green Energy Investments Surge to Record Highs",
                description: "Renewable energy sector attracts unprecedented $500 billion in global investments as companies accelerate their transition to sustainable business practices.",
                image: "https://picsum.photos/400/200?random=7",
                source: "Business Weekly",
                date: "2025-07-23T12:00:00Z",
                category: "Green Finance"
            },
            {
                id: 8,
                title: "E-commerce Giants Expand into Emerging Markets",
                description: "Major online retailers announce strategic expansion plans targeting Southeast Asia and Africa with innovative delivery solutions and local partnerships.",
                image: "https://picsum.photos/400/200?random=8",
                source: "Commerce Daily",
                date: "2025-07-23T11:45:00Z",
                category: "E-commerce"
            },
            {
                id: 9,
                title: "Cryptocurrency Market Shows Signs of Maturity",
                description: "Digital currencies demonstrate reduced volatility and increased institutional adoption as regulatory frameworks become clearer across major economies.",
                image: "https://picsum.photos/400/200?random=9",
                source: "Crypto News",
                date: "2025-07-23T10:15:00Z",
                category: "Cryptocurrency"
            }
        ],
        health: [
            {
                id: 10,
                title: "Gene Therapy Breakthrough for Rare Diseases",
                description: "Clinical trials show remarkable success in treating previously incurable genetic conditions, offering hope to millions of patients worldwide.",
                image: "https://picsum.photos/400/200?random=10",
                source: "Medical Journal",
                date: "2025-07-23T13:30:00Z",
                category: "Gene Therapy"
            },
            {
                id: 11,
                title: "Mental Health Awareness Campaign Launches Globally",
                description: "International initiative aims to reduce stigma and improve access to mental health resources, with support from major healthcare organizations.",
                image: "https://picsum.photos/400/200?random=11",
                source: "Health Today",
                date: "2025-07-23T12:15:00Z",
                category: "Mental Health"
            },
            {
                id: 12,
                title: "Breakthrough in Alzheimer's Research",
                description: "New treatment shows promising results in slowing cognitive decline, representing a major advancement in neurodegenerative disease research.",
                image: "https://picsum.photos/400/200?random=12",
                source: "Neuroscience News",
                date: "2025-07-23T11:00:00Z",
                category: "Neuroscience"
            }
        ],
        sports: [
            {
                id: 13,
                title: "World Cup Preparations Intensify",
                description: "Host nation completes final stadium preparations as teams from around the globe finalize their squads for the most anticipated sporting event of the year.",
                image: "https://picsum.photos/400/200?random=13",
                source: "Sports World",
                date: "2025-07-23T14:20:00Z",
                category: "Football"
            },
            {
                id: 14,
                title: "Olympic Records Broken at Championships",
                description: "Athletes set new world records across multiple disciplines at the international championships, raising excitement for upcoming Olympic competitions.",
                image: "https://picsum.photos/400/200?random=14",
                source: "Olympic News",
                date: "2025-07-23T13:45:00Z",
                category: "Olympics"
            },
            {
                id: 15,
                title: "Tennis Grand Slam Delivers Epic Final",
                description: "Thrilling championship match captivates millions of viewers worldwide as two tennis legends battle for the historic title in a five-set marathon.",
                image: "https://picsum.photos/400/200?random=15",
                source: "Tennis Today",
                date: "2025-07-23T12:30:00Z",
                category: "Tennis"
            }
        ]
    };

    return sampleData[category] || sampleData.general;
}

/**
 * Main function to load news for a specific category
 */
function loadNews(category) {
    console.log(`Loading news for category: ${category}`);
    
    currentCategory = category;
    updateActiveButton(category);
    
    // Clear search input when switching categories
    document.getElementById('search-input').value = '';
    
    // Check if data is already cached
    if (newsCache[category]) {
        console.log(`Loading ${category} news from cache`);
        displayNews(newsCache[category]);
        return;
    }

    // Show loading animation
    showLoading();

    // Simulate API call delay (in real app, this would be an actual API call)
    setTimeout(function() {
        try {
            const articles = getSampleNews(category);
            newsCache[category] = articles;
            displayNews(articles);
            console.log(`Successfully loaded ${articles.length} articles for ${category}`);
        } catch (error) {
            console.error('Error loading news:', error);
            showError('Unable to load news articles. Please check your connection and try again.');
        }
    }, 1200); // Simulate network delay
}

/**
 * Utility function to clear all caches (for development/testing)
 */
function clearCache() {
    newsCache = {};
    console.log('News cache cleared');
}

/**
 * Get application statistics (for debugging)
 */
function getAppStats() {
    return {
        currentCategory: currentCategory,
        currentView: currentView,
        cachedCategories: Object.keys(newsCache),
        totalArticlesLoaded: Object.values(newsCache).reduce((total, articles) => total + articles.length, 0),
        likedArticles: likedArticles.length,
        savedArticles: savedArticles.length
    };
}