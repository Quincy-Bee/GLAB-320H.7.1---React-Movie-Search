
import { useEffect, useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = "https://www.omdbapi.com/";

// 12 handpicked featured movies
const featuredTitles = [
  "The Dark Knight",
  "Liar liar",
  "The Matrix",
  "Prometheus",
  "casino",
  "eyes wide shut",
  "Apocalypto",
  "Predator 2",
  "They Live",
  "Ong Bak",
  "Lucy",
  "limitless",
  "Chucky",
  "juice",
  "He Got Game",
];

// Themed collections with search starting points
const collections = [
  { name: "Action", description: "High-energy adventures", icon: "💥", query: "Mission Impossible" },
  { name: "Horror", description: "Movies that keep you up", icon: "👻", query: "The Conjuring" },
  { name: "Sci-Fi", description: "Explore other worlds", icon: "🚀", query: "Star Wars" },
  { name: "Comedy", description: "Something to make you laugh", icon: "😂", query: "Superbad" },
  { name: "Animation", description: "Animated favorites", icon: "🎨", query: "Toy Story" },
];

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Load featured movies when homepage opens
  useEffect(() => {
    async function loadFeaturedMovies() {
      if (!API_KEY) {
        setError("Missing API key. Check your .env file.");
        return;
      }

      setLoading(true);

      try {
        const results = await Promise.all(
          featuredTitles.map(async (title) => {
            const params = new URLSearchParams({
              apikey: API_KEY,
              t: title,
              type: "movie",
            });

            const response = await fetch(`${API_URL}?${params}`);
            return response.json();
          })
        );

        setFeaturedMovies(
          results.filter((movie) => movie.Response === "True")
        );
      } catch (err) {
        setError("Unable to load featured movies.");
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedMovies();
  }, []);

  // Search for movies
  async function searchMovies(term, currentPage = 1) {
    if (!term.trim()) {
      setError("Please enter a movie title.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    setSelectedMovie(null);

    try {
      const params = new URLSearchParams({
        apikey: API_KEY,
        s: term,
        type: "movie",
        page: currentPage,
      });

      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();

      if (data.Response === "False") {
        setMovies([]);
        setTotalResults(0);
        setError(data.Error);
        return;
      }

      setMovies(data.Search);
      setTotalResults(Number(data.totalResults));
      setPage(currentPage);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Search form
  function handleSubmit(e) {
    e.preventDefault();
    searchMovies(searchTerm, 1);
  }

  // Open individual movie details
  async function getMovieDetails(imdbID) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        apikey: API_KEY,
        i: imdbID,
        plot: "full",
      });

      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();

      if (data.Response === "False") {
        setError(data.Error);
        return;
      }

      setSelectedMovie(data);

    } catch (err) {
      setError("Unable to load movie details.");
    } finally {
      setLoading(false);
    }
  }

  // Reusable movie card
  function MovieCard({ movie }) {
    return (
      <article className="movie-card">
        <div
          className="poster-container"
          onClick={() => getMovieDetails(movie.imdbID)}
        >
          {movie.Poster && movie.Poster !== "N/A" ? (
            <img src={movie.Poster} alt={movie.Title} />
          ) : (
            <div className="no-poster">No Poster</div>
          )}

          <div className="poster-overlay">
            <span>View Details</span>
          </div>
        </div>

        <h3>{movie.Title}</h3>
        <p>{movie.Year}</p>
      </article>
    );
  }

  const totalPages = Math.ceil(totalResults / 10);

  return (
    <main className="app">

      {/* NAVIGATION */}
      <nav className="navbar">
        <h2 onClick={() => {
          setHasSearched(false);
          setSelectedMovie(null);
          setError("");
        }}>
          CINE<span>SCAPE</span>
        </h2>

        <button
          className="home-button"
          onClick={() => {
            setHasSearched(false);
            setSelectedMovie(null);
            setError("");
          }}
        >
          Home
        </button>
      </nav>

      {/* SEARCH BAR */}
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>

      {loading && <p className="loading">Loading movies...</p>}

      {error && <p className="error">{error}</p>}

      {/* MOVIE DETAILS */}
      {selectedMovie && (
        <section className="movie-details">
          <button
            className="back-button"
            onClick={() => setSelectedMovie(null)}
          >
            ← Back
          </button>

          <div className="details-layout">
            <img
              src={selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : ""}
              alt={selectedMovie.Title}
            />

            <div>
              <h1>{selectedMovie.Title}</h1>
              <p>{selectedMovie.Year} · {selectedMovie.Runtime}</p>
              <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
              <p><strong>Director:</strong> {selectedMovie.Director}</p>
              <p><strong>Actors:</strong> {selectedMovie.Actors}</p>
              <p><strong>IMDb Rating:</strong> ⭐ {selectedMovie.imdbRating}</p>
              <h3>Synopsis</h3>
              <p>{selectedMovie.Plot}</p>
            </div>
          </div>
        </section>
      )}

      {/* HOMEPAGE */}
      {!hasSearched && !selectedMovie && (
        <section className="homepage">

          <div className="hero">
            <div className="hero-content">
              <span className="eyebrow">YOUR MOVIE DESTINATION</span>
              <h1>Discover your next favorite movie.</h1>
              <p>
                From timeless classics to hidden gems,
                find something worth watching.
              </p>
            </div>
          </div>

          {/* FEATURED MOVIES */}
          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">HANDPICKED FOR YOU</span>
                <h2>Featured Movies</h2>
              </div>
              <span className="section-label">12 PICKS</span>
            </div>

            <div className="movie-grid featured-grid">
              {featuredMovies.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>

            {!loading && featuredMovies.length === 0 && !error && (
              <p>Featured movies could not be loaded.</p>
            )}
          </section>

          {/* COLLECTIONS */}
          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">FIND YOUR MOOD</span>
                <h2>Explore Collections</h2>
              </div>
            </div>

            <div className="collection-grid">
              {collections.map((collection) => (
                <button
                  className="collection-card"
                  key={collection.name}
                  onClick={() => {
                    setSearchTerm(collection.query);
                    searchMovies(collection.query, 1);
                  }}
                >
                  <span className="collection-icon">
                    {collection.icon}
                  </span>
                  <h3>{collection.name}</h3>
                  <p>{collection.description}</p>
                  <span className="explore-link">Explore →</span>
                </button>
              ))}
            </div>
          </section>

        </section>
      )}

      {/* SEARCH RESULTS */}
      {hasSearched && !selectedMovie && (
        <section className="content-section results-section">
          <button
            className="back-button"
            onClick={() => {
              setHasSearched(false);
              setMovies([]);
              setError("");
            }}
          >
            ← Back to Discover
          </button>

          <h2>Search Results</h2>

          {movies.length > 0 && (
            <>
              <p>{totalResults} movies found</p>

              <div className="movie-grid">
                {movies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} />
                ))}
              </div>

              <div className="pagination">
                <button
                  disabled={page === 1 || loading}
                  onClick={() => searchMovies(searchTerm, page - 1)}
                >
                  Previous
                </button>

                <span>Page {page} of {totalPages}</span>

                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => searchMovies(searchTerm, page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      )}

    </main>
  );
}
