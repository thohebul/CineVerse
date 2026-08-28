/* =========================================================
   CINEVERSE - COMPLETE JAVASCRIPT
   TMDB API + Search + Genre + Details + Trailer
   Watchlist + Login/Signup + Dark Mode + Responsive Menu
   ========================================================= */


/* ================= TMDB CONFIG ================= */

// তোমার TMDB API Key
const API_KEY = "99ad4094308be607ef533f7fab054038";

const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";


/* ================= GLOBAL VARIABLES ================= */

let currentPage = 1;
let currentQuery = "";
let currentGenre = "all";
let currentMode = "popular";
let currentMovie = null;

let isLoading = false;


/* ================= GENRE NAMES ================= */

const genreNames = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    27: "Horror",
    10749: "Romance",
    878: "Sci-Fi",
    53: "Thriller",
    80: "Crime",
    18: "Drama",
    14: "Fantasy",
    36: "History",
    9648: "Mystery",
    10751: "Family",
    10752: "War",
    37: "Western",
    10402: "Music",
    99: "Documentary"
};


/* ================= DOM ELEMENTS ================= */

const body = document.body;

const themeBtn = document.getElementById("themeBtn");

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

const accountBtn = document.getElementById("accountBtn");
const accountText = document.getElementById("accountText");
const accountDropdown = document.getElementById("accountDropdown");

const dropdownName = document.getElementById("dropdownName");
const dropdownEmail = document.getElementById("dropdownEmail");

const dropdownWatchlist = document.getElementById("dropdownWatchlist");
const dropdownLogout = document.getElementById("dropdownLogout");

const heroSearchInput = document.getElementById("heroSearchInput");
const heroSearchBtn = document.getElementById("heroSearchBtn");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const searchResults = document.getElementById("searchResults");
const resultText = document.getElementById("resultText");

const loadMoreBtn = document.getElementById("loadMoreBtn");

const trendingMovies = document.getElementById("trendingMovies");
const topRatedMovies = document.getElementById("topRatedMovies");
const popularMovies = document.getElementById("popularMovies");

const watchlistMovies = document.getElementById("watchlistMovies");
const watchlistTotal = document.getElementById("watchlistTotal");

const watchCount = document.querySelector(".watch-count");

const exploreBtn = document.getElementById("exploreBtn");
const ctaSearchBtn = document.getElementById("ctaSearchBtn");

const trendingViewBtn = document.getElementById("trendingViewBtn");
const ratedViewBtn = document.getElementById("ratedViewBtn");


/* ================= MODAL ELEMENTS ================= */

const movieModal = document.getElementById("movieModal");
const movieModalClose = document.getElementById("movieModalClose");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalRating = document.getElementById("modalRating");
const modalYear = document.getElementById("modalYear");
const modalRuntime = document.getElementById("modalRuntime");
const modalGenres = document.getElementById("modalGenres");
const modalOverview = document.getElementById("modalOverview");

const trailerBtn = document.getElementById("trailerBtn");
const modalWatchlistBtn = document.getElementById("modalWatchlistBtn");


/* ================= TRAILER MODAL ================= */

const trailerModal = document.getElementById("trailerModal");
const trailerClose = document.getElementById("trailerClose");
const trailerContainer = document.getElementById("trailerContainer");


/* ================= AUTH MODAL ================= */

const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const footerLogin = document.getElementById("footerLogin");
const footerSignup = document.getElementById("footerSignup");


/* ================= TOAST ================= */

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastMessage = document.getElementById("toastMessage");

let toastTimer;


/* =========================================================
   API HELPER
   ========================================================= */

async function apiRequest(endpoint, params = {}) {

    const url = new URL(`${API_BASE}${endpoint}`);

    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("language", "en-US");

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, value);
        }
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
    }

    return await response.json();
}


/* =========================================================
   IMAGE HELPER
   ========================================================= */

function getPoster(path) {

    if (!path) {
        return "https://via.placeholder.com/500x750/14161e/ffffff?text=No+Poster";
    }

    return `${IMAGE_BASE}${path}`;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(text) {

    if (!text) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GET YEAR
   ========================================================= */

function getYear(date) {

    if (!date) {
        return "N/A";
    }

    return date.substring(0, 4);
}


/* =========================================================
   GET GENRE
   ========================================================= */

function getGenre(movie) {

    if (!movie.genre_ids || movie.genre_ids.length === 0) {
        return "Movie";
    }

    return genreNames[movie.genre_ids[0]] || "Movie";
}


/* =========================================================
   GET WATCHLIST
   ========================================================= */

function getCurrentUser() {

    try {
        return JSON.parse(localStorage.getItem("cineverseCurrentUser"));
    } catch {
        return null;
    }
}


function getUsers() {

    try {
        return JSON.parse(localStorage.getItem("cineverseUsers")) || [];
    } catch {
        return [];
    }
}


function getCurrentWatchlist() {

    const user = getCurrentUser();

    if (!user) {
        return [];
    }

    try {

        const allWatchlists =
            JSON.parse(localStorage.getItem("cineverseWatchlists")) || {};

        return allWatchlists[user.email] || [];

    } catch {

        return [];
    }
}


function saveCurrentWatchlist(list) {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    let allWatchlists = {};

    try {
        allWatchlists =
            JSON.parse(localStorage.getItem("cineverseWatchlists")) || {};
    } catch {
        allWatchlists = {};
    }

    allWatchlists[user.email] = list;

    localStorage.setItem(
        "cineverseWatchlists",
        JSON.stringify(allWatchlists)
    );
}


/* =========================================================
   IS MOVIE WATCHLISTED
   ========================================================= */

function isWatchlisted(movieId) {

    const list = getCurrentWatchlist();

    return list.some(movie => movie.id === movieId);
}


/* =========================================================
   UPDATE WATCHLIST COUNT
   ========================================================= */

function updateWatchlistCount() {

    const list = getCurrentWatchlist();

    if (watchCount) {
        watchCount.textContent = list.length;
    }

    if (watchlistTotal) {
        watchlistTotal.textContent = list.length;
    }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, icon = "✓") {

    clearTimeout(toastTimer);

    toastIcon.textContent = icon;
    toastMessage.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


/* =========================================================
   LOADING SKELETON
   ========================================================= */

function showLoading(container, count = 5) {

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {

        const card = document.createElement("div");

        card.className = "loading-card";

        card.innerHTML = `
            <div class="skeleton skeleton-poster"></div>
            <div class="skeleton skeleton-text"></div>
        `;

        container.appendChild(card);
    }
}


/* =========================================================
   MOVIE CARD
   ========================================================= */

function createMovieCard(movie) {

    const card = document.createElement("article");

    card.className = "movie-card";

    const saved = isWatchlisted(movie.id);

    const title = escapeHTML(
        movie.title || movie.name || "Unknown Movie"
    );

    const poster = getPoster(movie.poster_path);

    const rating =
        movie.vote_average
            ? Number(movie.vote_average).toFixed(1)
            : "N/A";

    const year = getYear(
        movie.release_date || movie.first_air_date
    );

    const genre = escapeHTML(getGenre(movie));

    card.innerHTML = `
        <div class="poster-wrapper">

            <img
                src="${poster}"
                alt="${title}"
                loading="lazy"
            >

            <div class="poster-gradient"></div>

            <div class="rating">
                ⭐ ${rating}
            </div>

            <button
                class="quick-watch"
                type="button"
                aria-label="View ${title}"
            >
                ▶
            </button>

        </div>

        <div class="card-info">

            <h3 class="card-title" title="${title}">
                ${title}
            </h3>

            <div class="card-meta">

                <span>
                    📅 ${year}
                </span>

                <span class="card-genre">
                    🎬 ${genre}
                </span>

            </div>

            <div class="card-actions">

                <button
                    class="card-action details-btn"
                    type="button"
                >
                    View Details
                </button>

                <button
                    class="card-action watchlist-action ${saved ? "watchlisted" : ""}"
                    type="button"
                >
                    ${saved ? "♥ Saved" : "♡ Watchlist"}
                </button>

            </div>

        </div>
    `;


    /* ================= CARD EVENTS ================= */

    const detailsButton =
        card.querySelector(".details-btn");

    const quickWatch =
        card.querySelector(".quick-watch");

    const watchlistButton =
        card.querySelector(".watchlist-action");


    detailsButton.addEventListener("click", (event) => {

        event.stopPropagation();

        openMovieModal(movie.id);
    });


    quickWatch.addEventListener("click", (event) => {

        event.stopPropagation();

        openMovieModal(movie.id);
    });


    watchlistButton.addEventListener("click", (event) => {

        event.stopPropagation();

        toggleWatchlist(movie);
    });


    return card;
}


/* =========================================================
   RENDER MOVIES
   ========================================================= */

function renderMovies(container, movies, append = false) {

    if (!append) {
        container.innerHTML = "";
    }

    if (!movies || movies.length === 0) {

        if (!append) {

            container.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🎬
                    </div>

                    <h3>No Movies Found</h3>

                    <p>
                        Try searching for another movie.
                    </p>

                </div>
            `;
        }

        return;
    }

    movies.forEach(movie => {

        container.appendChild(
            createMovieCard(movie)
        );

    });
}


/* =========================================================
   SEARCH MOVIES
   ========================================================= */

async function searchMovies(query, page = 1, append = false) {

    if (isLoading) return;

    isLoading = true;

    if (!append) {
        showLoading(searchResults, 5);
    }

    try {

        const data = await apiRequest("/search/movie", {
            query: query,
            page: page,
            include_adult: false
        });

        currentQuery = query;
        currentPage = page;
        currentMode = "search";

        renderMovies(
            searchResults,
            data.results,
            append
        );

        const total = data.total_results || 0;

        resultText.textContent =
            `${total.toLocaleString()} movie${total === 1 ? "" : "s"} found`;

        if (data.total_pages > page) {
            loadMoreBtn.style.display = "block";
        } else {
            loadMoreBtn.style.display = "none";
        }

        document
            .getElementById("movies")
            .scrollIntoView({
                behavior: "smooth"
            });

    } catch (error) {

        console.error(error);

        searchResults.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>Something Went Wrong</h3>

                <p>
                    Could not load movies. Please try again.
                </p>

            </div>
        `;

        showToast(
            "Could not connect to TMDB.",
            "⚠"
        );

    } finally {

        isLoading = false;
    }
}


/* =========================================================
   POPULAR MOVIES FOR MAIN MOVIE LIBRARY
   ========================================================= */

async function loadPopularMovies() {

    showLoading(searchResults, 5);

    try {

        const data = await apiRequest(
            "/movie/popular",
            {
                page: 1
            }
        );

        currentMode = "popular";
        currentPage = 1;
        currentQuery = "";

        renderMovies(
            searchResults,
            data.results
        );

        resultText.textContent =
            "Popular movies you may love";

        loadMoreBtn.style.display = "block";

    } catch (error) {

        console.error(error);

        searchResults.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">⚠️</div>

                <h3>Unable to Load Movies</h3>

                <p>Please check your internet connection.</p>

            </div>
        `;
    }
}


/* =========================================================
   LOAD MORE MAIN MOVIES
   ========================================================= */

async function loadMoreMovies() {

    if (isLoading) return;

    isLoading = true;

    loadMoreBtn.textContent = "Loading...";

    try {

        const nextPage = currentPage + 1;

        let data;

        if (currentMode === "search") {

            data = await apiRequest(
                "/search/movie",
                {
                    query: currentQuery,
                    page: nextPage,
                    include_adult: false
                }
            );

        } else if (currentMode === "genre") {

            data = await apiRequest(
                "/discover/movie",
                {
                    with_genres: currentGenre,
                    page: nextPage,
                    sort_by: "popularity.desc",
                    include_adult: false
                }
            );

        } else {

            data = await apiRequest(
                "/movie/popular",
                {
                    page: nextPage
                }
            );
        }

        renderMovies(
            searchResults,
            data.results,
            true
        );

        currentPage = nextPage;

        if (data.total_pages <= nextPage) {
            loadMoreBtn.style.display = "none";
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Could not load more movies.",
            "⚠"
        );

    } finally {

        isLoading = false;

        loadMoreBtn.textContent = "Load More";
    }
}


/* =========================================================
   GENRE MOVIES
   ========================================================= */

async function loadGenreMovies(genreId) {

    if (genreId === "all") {

        currentGenre = "all";

        loadPopularMovies();

        return;
    }

    if (isLoading) return;

    isLoading = true;

    showLoading(searchResults, 5);

    try {

        const data = await apiRequest(
            "/discover/movie",
            {
                with_genres: genreId,
                page: 1,
                sort_by: "popularity.desc",
                include_adult: false
            }
        );

        currentMode = "genre";
        currentGenre = genreId;
        currentPage = 1;

        renderMovies(
            searchResults,
            data.results
        );

        const genreName =
            genreNames[genreId] || "Movies";

        resultText.textContent =
            `${genreName} movies`;

        if (data.total_pages > 1) {
            loadMoreBtn.style.display = "block";
        } else {
            loadMoreBtn.style.display = "none";
        }

        document
            .getElementById("movies")
            .scrollIntoView({
                behavior: "smooth"
            });

    } catch (error) {

        console.error(error);

        showToast(
            "Could not load this genre.",
            "⚠"
        );

    } finally {

        isLoading = false;
    }
}


/* =========================================================
   TRENDING MOVIES
   ========================================================= */

async function loadTrending() {

    showLoading(trendingMovies, 5);

    try {

        const data = await apiRequest(
            "/trending/movie/week"
        );

        renderMovies(
            trendingMovies,
            data.results.slice(0, 10)
        );

    } catch (error) {

        console.error(error);

        trendingMovies.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to Load Trending Movies</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}


/* =========================================================
   TOP RATED MOVIES
   ========================================================= */

async function loadTopRated() {

    showLoading(topRatedMovies, 5);

    try {

        const data = await apiRequest(
            "/movie/top_rated",
            {
                page: 1
            }
        );

        renderMovies(
            topRatedMovies,
            data.results.slice(0, 10)
        );

    } catch (error) {

        console.error(error);

        topRatedMovies.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to Load Top Rated Movies</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}


/* =========================================================
   POPULAR MOVIES SECTION
   ========================================================= */

async function loadPopularSection() {

    showLoading(popularMovies, 5);

    try {

        const data = await apiRequest(
            "/movie/popular",
            {
                page: 2
            }
        );

        renderMovies(
            popularMovies,
            data.results.slice(0, 10)
        );

    } catch (error) {

        console.error(error);

        popularMovies.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to Load Popular Movies</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}


/* =========================================================
   MOVIE DETAILS
   ========================================================= */

async function openMovieModal(movieId) {

    movieModal.classList.add("show");

    document.body.style.overflow = "hidden";

    modalTitle.textContent = "Loading...";
    modalRating.textContent = "⭐ ...";
    modalYear.textContent = "📅 ...";
    modalRuntime.textContent = "⏱ ...";

    modalOverview.textContent =
        "Loading movie information...";

    modalGenres.innerHTML = "";

    modalPoster.src = getPoster(null);

    modalBackdrop.style.backgroundImage = "none";

    try {

        const movie = await apiRequest(
            `/movie/${movieId}`
        );

        currentMovie = movie;

        modalTitle.textContent =
            movie.title || "Unknown Movie";

        modalRating.textContent =
            `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}`;

        modalYear.textContent =
            `📅 ${getYear(movie.release_date)}`;

        modalRuntime.textContent =
            `⏱ ${movie.runtime || 0}m`;

        modalPoster.src =
            getPoster(movie.poster_path);

        modalPoster.alt =
            movie.title || "Movie poster";

        if (movie.backdrop_path) {

            modalBackdrop.style.backgroundImage =
                `url("${BACKDROP_BASE}${movie.backdrop_path}")`;
        }

        modalOverview.textContent =
            movie.overview ||
            "No description is available for this movie.";

        modalGenres.innerHTML = "";

        if (movie.genres && movie.genres.length) {

            movie.genres.forEach(genre => {

                const span =
                    document.createElement("span");

                span.className = "modal-genre";

                span.textContent = genre.name;

                modalGenres.appendChild(span);
            });
        }

        updateModalWatchlistButton();

    } catch (error) {

        console.error(error);

        modalTitle.textContent =
            "Unable to Load Movie";

        modalOverview.textContent =
            "Something went wrong while loading movie details.";

        showToast(
            "Could not load movie details.",
            "⚠"
        );
    }
}


/* =========================================================
   UPDATE MODAL WATCHLIST BUTTON
   ========================================================= */

function updateModalWatchlistButton() {

    if (!currentMovie) return;

    const saved =
        isWatchlisted(currentMovie.id);

    if (saved) {

        modalWatchlistBtn.textContent =
            "❤️ Remove from Watchlist";

        modalWatchlistBtn.classList.add("saved");

    } else {

        modalWatchlistBtn.textContent =
            "❤️ Add to Watchlist";

        modalWatchlistBtn.classList.remove("saved");
    }
}


/* =========================================================
   TOGGLE WATCHLIST
   ========================================================= */

function toggleWatchlist(movie) {

    const user = getCurrentUser();

    if (!user) {

        showToast(
            "Please login to use Watchlist.",
            "🔐"
        );

        openAuthModal("login");

        return;
    }

    let list = getCurrentWatchlist();

    const existingIndex =
        list.findIndex(item => item.id === movie.id);

    if (existingIndex !== -1) {

        list.splice(existingIndex, 1);

        showToast(
            "Removed from Watchlist.",
            "✓"
        );

    } else {

        const savedMovie = {

            id: movie.id,

            title: movie.title || movie.name,

            poster_path: movie.poster_path,

            backdrop_path: movie.backdrop_path,

            vote_average: movie.vote_average,

            release_date:
                movie.release_date ||
                movie.first_air_date,

            genre_ids:
                movie.genre_ids ||
                (movie.genres
                    ? movie.genres.map(g => g.id)
                    : [])
        };

        list.push(savedMovie);

        showToast(
            "Added to Watchlist ❤️",
            "♥"
        );
    }

    saveCurrentWatchlist(list);

    updateWatchlistCount();

    refreshWatchlist();

    refreshAllVisibleWatchlistButtons();

    updateModalWatchlistButton();
}


/* =========================================================
   REFRESH WATCHLIST BUTTONS
   ========================================================= */

function refreshAllVisibleWatchlistButtons() {

    document
        .querySelectorAll(".watchlist-action")
        .forEach(button => {

            const card =
                button.closest(".movie-card");

            if (!card) return;

            const title =
                card.querySelector(".card-title");

            if (!title) return;

            const movieName =
                title.textContent.trim();

            const list =
                getCurrentWatchlist();

            const saved =
                list.some(movie =>
                    movie.title === movieName
                );

            if (saved) {

                button.textContent =
                    "♥ Saved";

                button.classList.add(
                    "watchlisted"
                );

            } else {

                button.textContent =
                    "♡ Watchlist";

                button.classList.remove(
                    "watchlisted"
                );
            }
        });
}


/* =========================================================
   WATCHLIST SECTION
   ========================================================= */

function refreshWatchlist() {

    const list =
        getCurrentWatchlist();

    updateWatchlistCount();

    if (!getCurrentUser()) {

        watchlistMovies.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔐
                </div>

                <h3>Login Required</h3>

                <p>
                    Login to create your personal watchlist.
                </p>

            </div>
        `;

        return;
    }

    if (list.length === 0) {

        watchlistMovies.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ❤️
                </div>

                <h3>Your Watchlist Is Empty</h3>

                <p>
                    Add movies you want to watch later.
                </p>

            </div>
        `;

        return;
    }

    renderMovies(
        watchlistMovies,
        list
    );
}


/* =========================================================
   TRAILER
   ========================================================= */

async function openTrailer(movieId) {

    trailerModal.classList.add("show");

    document.body.style.overflow = "hidden";

    trailerContainer.innerHTML = `
        <div class="trailer-loading">
            Loading trailer...
        </div>
    `;

    try {

        const data = await apiRequest(
            `/movie/${movieId}/videos`
        );

        const videos =
            data.results || [];

        const trailer =
            videos.find(video =>
                video.site === "YouTube" &&
                video.type === "Trailer"
            ) ||
            videos.find(video =>
                video.site === "YouTube" &&
                video.type === "Teaser"
            ) ||
            videos.find(video =>
                video.site === "YouTube"
            );

        if (!trailer) {

            trailerContainer.innerHTML = `
                <div class="trailer-loading">
                    Trailer not available.
                </div>
            `;

            return;
        }

        trailerContainer.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${trailer.key}?autoplay=1"
                title="Movie Trailer"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen
            ></iframe>
        `;

    } catch (error) {

        console.error(error);

        trailerContainer.innerHTML = `
            <div class="trailer-loading">
                Trailer could not be loaded.
            </div>
        `;
    }
}


function closeTrailerModal() {

    trailerModal.classList.remove("show");

    trailerContainer.innerHTML = `
        <div class="trailer-loading">
            Loading trailer...
        </div>
    `;

    if (
        !movieModal.classList.contains("show") &&
        !authModal.classList.contains("show")
    ) {
        document.body.style.overflow = "";
    }
}


/* =========================================================
   MOVIE MODAL CLOSE
   ========================================================= */

function closeMovieModal() {

    movieModal.classList.remove("show");

    currentMovie = null;

    modalBackdrop.style.backgroundImage = "none";

    if (
        !trailerModal.classList.contains("show") &&
        !authModal.classList.contains("show")
    ) {
        document.body.style.overflow = "";
    }
}


/* =========================================================
   AUTH MODAL
   ========================================================= */

function openAuthModal(mode = "login") {

    authModal.classList.add("show");

    document.body.style.overflow = "hidden";

    accountDropdown.classList.remove("show");

    if (mode === "signup") {

        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");

        authTitle.textContent =
            "Create Account";

        authSubtitle.textContent =
            "Join CineVerse and start your movie journey.";

    } else {

        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

        authTitle.textContent =
            "Welcome Back";

        authSubtitle.textContent =
            "Login to continue your CineVerse journey.";
    }
}


function closeAuthModal() {

    authModal.classList.remove("show");

    document.body.style.overflow = "";

    loginForm.reset();
    signupForm.reset();
}


/* =========================================================
   UPDATE ACCOUNT UI
   ========================================================= */

function updateAccountUI() {

    const user = getCurrentUser();

    if (user) {

        accountText.textContent =
            user.name;

        dropdownName.textContent =
            user.name;

        dropdownEmail.textContent =
            user.email;

    } else {

        accountText.textContent =
            "Account";

        dropdownName.textContent =
            "Guest";

        dropdownEmail.textContent =
            "Not logged in";
    }

    updateWatchlistCount();
}


/* =========================================================
   LOGIN
   ========================================================= */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email =
        loginEmail.value.trim().toLowerCase();

    const password =
        loginPassword.value;

    const users = getUsers();

    const user =
        users.find(item =>
            item.email === email &&
            item.password === password
        );

    if (!user) {

        showToast(
            "Invalid email or password.",
            "⚠"
        );

        return;
    }

    localStorage.setItem(
        "cineverseCurrentUser",
        JSON.stringify({
            name: user.name,
            email: user.email
        })
    );

    updateAccountUI();

    refreshWatchlist();

    closeAuthModal();

    showToast(
        `Welcome back, ${user.name}! 👋`,
        "✓"
    );
});


/* =========================================================
   SIGNUP
   ========================================================= */

signupForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name =
        signupName.value.trim();

    const email =
        signupEmail.value.trim().toLowerCase();

    const password =
        signupPassword.value;

    let users = getUsers();

    const exists =
        users.some(user =>
            user.email === email
        );

    if (exists) {

        showToast(
            "An account with this email already exists.",
            "⚠"
        );

        return;
    }

    const newUser = {

        name: name,

        email: email,

        password: password
    };

    users.push(newUser);

    localStorage.setItem(
        "cineverseUsers",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "cineverseCurrentUser",
        JSON.stringify({
            name: name,
            email: email
        })
    );

    updateAccountUI();

    refreshWatchlist();

    closeAuthModal();

    showToast(
        "Account created successfully! 🎉",
        "✓"
    );
});


/* =========================================================
   LOGOUT
   ========================================================= */

dropdownLogout.addEventListener("click", function () {

    localStorage.removeItem(
        "cineverseCurrentUser"
    );

    updateAccountUI();

    refreshWatchlist();

    accountDropdown.classList.remove("show");

    showToast(
        "You have been logged out.",
        "✓"
    );
});


/* =========================================================
   ACCOUNT DROPDOWN
   ========================================================= */

accountBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    accountDropdown.classList.toggle("show");
});


document.addEventListener("click", function (event) {

    if (
        !accountDropdown.contains(event.target) &&
        !accountBtn.contains(event.target)
    ) {

        accountDropdown.classList.remove("show");
    }
});


/* =========================================================
   DROPDOWN WATCHLIST
   ========================================================= */

dropdownWatchlist.addEventListener("click", function () {

    accountDropdown.classList.remove("show");

    document
        .getElementById("watchlist")
        .scrollIntoView({
            behavior: "smooth"
        });
});


/* =========================================================
   SHOW SIGNUP
   ========================================================= */

showSignup.addEventListener("click", function () {

    openAuthModal("signup");
});


/* =========================================================
   SHOW LOGIN
   ========================================================= */

showLogin.addEventListener("click", function () {

    openAuthModal("login");
});


/* =========================================================
   FOOTER LOGIN
   ========================================================= */

footerLogin.addEventListener("click", function (event) {

    event.preventDefault();

    openAuthModal("login");
});


/* =========================================================
   FOOTER SIGNUP
   ========================================================= */

footerSignup.addEventListener("click", function (event) {

    event.preventDefault();

    openAuthModal("signup");
});


/* =========================================================
   THEME
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "cineverseTheme"
        );

    if (savedTheme === "light") {

        body.classList.add(
            "light-theme"
        );

        themeBtn.textContent = "☀️";

    } else {

        body.classList.remove(
            "light-theme"
        );

        themeBtn.textContent = "🌙";
    }
}


themeBtn.addEventListener("click", function () {

    body.classList.toggle("light-theme");

    const light =
        body.classList.contains(
            "light-theme"
        );

    localStorage.setItem(
        "cineverseTheme",
        light ? "light" : "dark"
    );

    themeBtn.textContent =
        light ? "☀️" : "🌙";
});


/* =========================================================
   MOBILE MENU
   ========================================================= */

menuBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    navbar.classList.toggle("open");

    menuBtn.textContent =
        navbar.classList.contains("open")
            ? "✕"
            : "☰";
});


/* =========================================================
   CLOSE MOBILE MENU AFTER LINK CLICK
   ========================================================= */

document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener("click", function () {

            navbar.classList.remove("open");

            menuBtn.textContent = "☰";

            document
                .querySelectorAll(".nav-link")
                .forEach(item =>
                    item.classList.remove("active")
                );

            this.classList.add("active");
        });
    });


/* =========================================================
   HERO SEARCH
   ========================================================= */

heroSearchBtn.addEventListener("click", function () {

    const query =
        heroSearchInput.value.trim();

    if (!query) {

        showToast(
            "Please enter a movie name.",
            "🔍"
        );

        heroSearchInput.focus();

        return;
    }

    searchInput.value = query;

    searchMovies(
        query,
        1,
        false
    );
});


heroSearchInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        heroSearchBtn.click();
    }
});


/* =========================================================
   MAIN SEARCH
   ========================================================= */

searchBtn.addEventListener("click", function () {

    const query =
        searchInput.value.trim();

    if (!query) {

        showToast(
            "Please enter a movie name.",
            "🔍"
        );

        searchInput.focus();

        return;
    }

    searchMovies(
        query,
        1,
        false
    );
});


searchInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        searchBtn.click();
    }
});


/* =========================================================
   GENRE BUTTONS
   ========================================================= */

document
    .querySelectorAll(".genre-btn")
    .forEach(button => {

        button.addEventListener("click", function () {

            document
                .querySelectorAll(".genre-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            this.classList.add("active");

            const genre =
                this.dataset.genre;

            searchInput.value = "";

            currentQuery = "";

            loadGenreMovies(genre);
        });
    });


/* =========================================================
   LOAD MORE BUTTON
   ========================================================= */

loadMoreBtn.addEventListener(
    "click",
    loadMoreMovies
);


/* =========================================================
   EXPLORE BUTTON
   ========================================================= */

exploreBtn.addEventListener("click", function () {

    document
        .getElementById("movies")
        .scrollIntoView({
            behavior: "smooth"
        });
});


/* =========================================================
   CTA SEARCH BUTTON
   ========================================================= */

ctaSearchBtn.addEventListener("click", function () {

    document
        .getElementById("movies")
        .scrollIntoView({
            behavior: "smooth"
        });

    setTimeout(() => {

        searchInput.focus();

    }, 600);
});


/* =========================================================
   TRENDING VIEW ALL
   ========================================================= */

trendingViewBtn.addEventListener("click", function () {

    document
        .getElementById("trending")
        .scrollIntoView({
            behavior: "smooth"
        });
});


/* =========================================================
   TOP RATED VIEW ALL
   ========================================================= */

ratedViewBtn.addEventListener("click", function () {

    document
        .querySelector(".movie-section.alternate")
        .scrollIntoView({
            behavior: "smooth"
        });
});


/* =========================================================
   MOVIE MODAL - X BUTTON
   ========================================================= */

movieModalClose.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        event.stopPropagation();

        closeMovieModal();
    }
);


/* =========================================================
   MOVIE MODAL - OUTSIDE CLICK
   ========================================================= */

movieModal.addEventListener(
    "click",
    function (event) {

        /*
         * শুধু overlay-তে click হলে modal close হবে।
         * ভিতরের movie-modal-এ click করলে close হবে না।
         */

        if (event.target === movieModal) {

            closeMovieModal();
        }
    }
);


/* =========================================================
   TRAILER BUTTON
   ========================================================= */

trailerBtn.addEventListener("click", function () {

    if (!currentMovie) {

        showToast(
            "Movie information is not ready.",
            "⚠"
        );

        return;
    }

    openTrailer(
        currentMovie.id
    );
});


/* =========================================================
   MOVIE MODAL WATCHLIST
   ========================================================= */

modalWatchlistBtn.addEventListener(
    "click",
    function () {

        if (!currentMovie) return;

        toggleWatchlist(currentMovie);
    }
);


/* =========================================================
   TRAILER CLOSE - X
   ========================================================= */

trailerClose.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        event.stopPropagation();

        closeTrailerModal();
    }
);


/* =========================================================
   TRAILER OUTSIDE CLICK
   ========================================================= */

trailerModal.addEventListener(
    "click",
    function (event) {

        if (event.target === trailerModal) {

            closeTrailerModal();
        }
    }
);


/* =========================================================
   AUTH CLOSE - X
   ========================================================= */

authClose.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        event.stopPropagation();

        closeAuthModal();
    }
);


/* =========================================================
   AUTH OUTSIDE CLICK
   ========================================================= */

authModal.addEventListener(
    "click",
    function (event) {

        if (event.target === authModal) {

            closeAuthModal();
        }
    }
);


/* =========================================================
   ESC KEY CLOSE ALL MODALS
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") return;

        if (trailerModal.classList.contains("show")) {

            closeTrailerModal();

            return;
        }

        if (movieModal.classList.contains("show")) {

            closeMovieModal();

            return;
        }

        if (authModal.classList.contains("show")) {

            closeAuthModal();

            return;
        }

        accountDropdown.classList.remove("show");
    }
);


/* =========================================================
   PREVENT MODAL CONTENT CLICK FROM CLOSING
   ========================================================= */

const movieModalBox =
    document.querySelector(".movie-modal");

const trailerModalBox =
    document.querySelector(".trailer-modal");

const authModalBox =
    document.querySelector(".auth-modal");


if (movieModalBox) {

    movieModalBox.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();
        }
    );
}


if (trailerModalBox) {

    trailerModalBox.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();
        }
    );
}


if (authModalBox) {

    authModalBox.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();
        }
    );
}


/* =========================================================
   WATCHLIST LINK
   ========================================================= */

document
    .querySelectorAll('a[href="#watchlist"]')
    .forEach(link => {

        link.addEventListener("click", function () {

            refreshWatchlist();
        });
    });


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeCineVerse() {

    loadTheme();

    updateAccountUI();

    refreshWatchlist();

    /*
     * Main Movie Library
     */
    loadPopularMovies();

    /*
     * Trending
     */
    loadTrending();

    /*
     * Top Rated
     */
    loadTopRated();

    /*
     * Popular
     */
    loadPopularSection();
}


/* =========================================================
   START WEBSITE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeCineVerse();

    }
);