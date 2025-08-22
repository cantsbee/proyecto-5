const appState = {
    currentQuote: null,
    quotesViewed: 0,
    favorites: [],
    shares: 0,
    recentQuotes: []
};

const QUOTE_APIS = {
    zenquotes: 'https://zenquotes.io/api/random',
    quotable: 'https://api.quotable.io/random',
    quotegarden: 'https://quote-garden.herokuapp.com/api/v3/quotes/random'
};

import { createHeader } from './components/header.js';

import { createFooter } from './components/footer.js';

const initializeApp = () => {
    console.log('🚀 Iniciando aplicación de frases...');
    
    createHeader();
    createFooter();
    
    loadAppState();
    
    setupEventListeners();
    
    loadRandomQuote();
    
    updateStats();
    
    initializeTheme();
    
    console.log('✅ Aplicación inicializada');
};

const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '☀️ Modo Claro';
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '🌙 Modo Oscuro';
    }
    
    console.log(`✅ Tema inicializado: ${savedTheme}`);
};

const toggleTheme = () => {
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '🌙 Modo Oscuro';
        localStorage.setItem('theme', 'light');
        showNotification('Modo claro activado', 'success');
    } else {
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '☀️ Modo Claro';
        localStorage.setItem('theme', 'dark');
        showNotification('Modo oscuro activado', 'success');
    }
    
    console.log(`🎨 Tema cambiado a: ${isDark ? 'light' : 'dark'}`);
};

const setupEventListeners = () => {
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const shareBtn = document.getElementById('share-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const copyBtn = document.getElementById('copy-btn');
    
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', loadRandomQuote);
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', shareQuote);
    }
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyQuote);
    }
    
    const headerNewQuoteBtn = document.querySelector('.btn-primary');
    if (headerNewQuoteBtn) {
        headerNewQuoteBtn.addEventListener('click', loadRandomQuote);
    }
};

const loadRandomQuote = async () => {
    showLoading();
    
    try {
        let quote = await fetchFromZenQuotes();
        
        if (!quote) {
            quote = await fetchFromQuotable();
        }
        
        if (!quote) {
            quote = await fetchFromQuoteGarden();
        }
        
        if (!quote) {
            quote = getRandomFallbackQuote();
        }
        
        displayQuote(quote);
        addToRecentQuotes(quote);
        updateStats();
        
    } catch (error) {
        console.error('Error cargando frase:', error);
        showError('Error al cargar la frase. Inténtalo de nuevo.');
    }
};

const fetchFromZenQuotes = async () => {
    try {
        const response = await fetch(QUOTE_APIS.zenquotes);
        if (!response.ok) throw new Error('ZenQuotes API error');
        
        const data = await response.json();
        if (data && data[0]) {
            return {
                text: data[0].q,
                author: data[0].a
            };
        }
    } catch (error) {
        console.warn('ZenQuotes API falló:', error.message);
        return null;
    }
};

const fetchFromQuotable = async () => {
    try {
        const response = await fetch(QUOTE_APIS.quotable);
        if (!response.ok) throw new Error('Quotable API error');
        
        const data = await response.json();
        if (data) {
            return {
                text: data.content,
                author: data.author
            };
        }
    } catch (error) {
        console.warn('Quotable API falló:', error.message);
        return null;
    }
};

const fetchFromQuoteGarden = async () => {
    try {
        const response = await fetch(QUOTE_APIS.quotegarden);
        if (!response.ok) throw new Error('Quote Garden API error');
        
        const data = await response.json();
        if (data && data.statusCode === 200 && data.data) {
            return {
                text: data.data.quoteText.replace(/"/g, ''),
                author: data.data.quoteAuthor
            };
        }
    } catch (error) {
        console.warn('Quote Garden API falló:', error.message);
        return null;
    }
};

const displayQuote = (quote) => {
    appState.currentQuote = quote;
    appState.quotesViewed++;
    
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    
    if (quoteText && quoteAuthor) {
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
        
        animateQuoteEntry();
    }
    
    hideLoading();
    saveAppState();
};

const animateQuoteEntry = () => {
    const quoteContent = document.getElementById('quote-content');
    if (quoteContent) {
        quoteContent.style.opacity = '0';
        quoteContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            quoteContent.style.transition = 'all 0.5s ease';
            quoteContent.style.opacity = '1';
            quoteContent.style.transform = 'translateY(0)';
        }, 100);
    }
};

const showLoading = () => {
    const loading = document.getElementById('loading');
    const quoteContent = document.getElementById('quote-content');
    
    if (loading) loading.style.display = 'block';
    if (quoteContent) quoteContent.style.display = 'none';
};

const hideLoading = () => {
    const loading = document.getElementById('loading');
    const quoteContent = document.getElementById('quote-content');
    
    if (loading) loading.style.display = 'none';
    if (quoteContent) quoteContent.style.display = 'block';
};

const shareQuote = async () => {
    if (!appState.currentQuote) return;
    
    const shareText = `"${appState.currentQuote.text}" — ${appState.currentQuote.author}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Frase Inspiradora',
                text: shareText,
                url: window.location.href
            });
            
            appState.shares++;
            updateStats();
            saveAppState();
            showNotification('¡Frase compartida!', 'success');
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error compartiendo:', error);
                copyToClipboard(shareText);
            }
        }
    } else {
        copyToClipboard(shareText);
    }
};

const toggleFavorite = () => {
    if (!appState.currentQuote) return;
    
    const quoteId = btoa(appState.currentQuote.text);
    const existingIndex = appState.favorites.findIndex(fav => fav.id === quoteId);
    
    if (existingIndex >= 0) {
        appState.favorites.splice(existingIndex, 1);
        showNotification('Quitado de favoritos', 'info');
    } else {
        appState.favorites.push({
            id: quoteId,
            ...appState.currentQuote,
            addedAt: new Date().toISOString()
        });
        showNotification('¡Añadido a favoritos!', 'success');
    }
    
    updateStats();
    saveAppState();
    updateFavoriteButton();
};

const updateFavoriteButton = () => {
    if (!appState.currentQuote) return;
    
    const favoriteBtn = document.getElementById('favorite-btn');
    const quoteId = btoa(appState.currentQuote.text);
    const isFavorite = appState.favorites.some(fav => fav.id === quoteId);
    
    if (favoriteBtn) {
        const span = favoriteBtn.querySelector('span');
        if (span) {
            span.textContent = isFavorite ? '💖' : '❤️';
        }
    }
};

const copyQuote = () => {
    if (!appState.currentQuote) return;
    
    const shareText = `"${appState.currentQuote.text}" — ${appState.currentQuote.author}`;
    copyToClipboard(shareText);
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('¡Copiado al portapapeles!', 'success');
    } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showNotification('¡Copiado al portapapeles!', 'success');
        } catch (fallbackError) {
            showNotification('No se pudo copiar', 'error');
        }
        
        document.body.removeChild(textArea);
    }
};

const addToRecentQuotes = (quote) => {
    const quoteWithId = {
        id: btoa(quote.text),
        ...quote,
        viewedAt: new Date().toISOString()
    };
    
    appState.recentQuotes = appState.recentQuotes.filter(q => q.id !== quoteWithId.id);
    
    appState.recentQuotes.unshift(quoteWithId);
    
    appState.recentQuotes = appState.recentQuotes.slice(0, 5);
    
    displayRecentQuotes();
    saveAppState();
};

const displayRecentQuotes = () => {
    const recentContainer = document.getElementById('recent-quotes');
    if (!recentContainer || appState.recentQuotes.length === 0) return;
    
    recentContainer.innerHTML = appState.recentQuotes.map(quote => `
        <div class="recent-quote" data-quote-id="${quote.id}">
            <p class="recent-text">"${truncateText(quote.text, 80)}"</p>
            <cite class="recent-author">— ${quote.author}</cite>
        </div>
    `).join('');
    
    const recentQuoteElements = recentContainer.querySelectorAll('.recent-quote');
    recentQuoteElements.forEach(element => {
        element.addEventListener('click', () => {
            const quoteId = element.dataset.quoteId;
            const quote = appState.recentQuotes.find(q => q.id === quoteId);
            if (quote) {
                displayQuote(quote);
            }
        });
    });
};

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

const updateStats = () => {
    const quotesCountEl = document.getElementById('quotes-count');
    const favoritesCountEl = document.getElementById('favorites-count');
    const sharesCountEl = document.getElementById('shares-count');
    
    if (quotesCountEl) quotesCountEl.textContent = appState.quotesViewed;
    if (favoritesCountEl) favoritesCountEl.textContent = appState.favorites.length;
    if (sharesCountEl) sharesCountEl.textContent = appState.shares;
    
    updateFavoriteButton();
};

const showNotification = (message, type = 'info') => {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notificationsContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
};

const hideNotification = (notification) => {
    if (notification && notification.parentNode) {
        notification.classList.remove('notification-show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
};

const showError = (message) => {
    showNotification(message, 'error');
    hideLoading();
};

const loadAppState = () => {
    try {
        const savedState = localStorage.getItem('quotesAppState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            Object.assign(appState, parsedState);
        }
    } catch (error) {
        console.warn('Error cargando estado guardado:', error);
    }
};

const saveAppState = () => {
    try {
        localStorage.setItem('quotesAppState', JSON.stringify(appState));
    } catch (error) {
        console.warn('Error guardando estado:', error);
    }
};

document.addEventListener('DOMContentLoaded', initializeApp);



const FALLBACK_QUOTES = [
    {
        text: "El mundo hay que creárselo uno mismo.",
        author: "Ana María Matute"
    },
    {
        text: "No te olvides de que por mucho q estudies y por mucho que aprendas y por muy inteligente q seas, al final te vas a morir.",
        author: "Jesús G Maestro."
    },
    
    {
        text: "Sé el cambio que quieres ver en el mundo.",
        author: "Mahatma Gandhi"
    },
    {
        text: "La imaginación es más importante que el conocimiento.",
        author: "Albert Einstein"
    }
];

const getRandomFallbackQuote = () => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
    return FALLBACK_QUOTES[randomIndex];
};

