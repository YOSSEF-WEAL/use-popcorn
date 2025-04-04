import { useEffect, useState } from "react";
import StaticRange from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "2ef73cfc";

export default function App()
{
  const [query, setQuery] = useState("");
  // Inception
  //interstellar
  const [movies, setMovies] = useState([]);
  const [isLoging, setIsLoging] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useState(function ()
  {
    const storedValue = localStorage.getItem('watched');
    return JSON.parse(storedValue);
  });

  function handleSelectMovie(id)
  {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie()
  {
    setSelectedId(null);
  }

  function handleAddWatch(movie)
  {
    setWatched((watched) => [...watched, movie]);

  }

  function handleDeleteWatched(id)
  {
    setWatched(watched => watched.filter((movie) => movie.imdbID !== id))
  }

  useEffect(function ()
  {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched]);

  useEffect(
    function ()
    {
      const controller = new AbortController();
      async function fetchMoveis()
      {
        try
        {
          setIsLoging(true);
          setError("");

          const res = await fetch(
            `https://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`, { signal: controller.signal });

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies ");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");

        } catch (error)
        {
          if (error !== "AbortError")
          {
            console.error(error.message);
            setError(error.message);
          }

        } finally
        {
          setIsLoging(false);
        }
      }
      if (query.length < 3)
      {
        setMovies([]);
        setError("");
        return;
      }

      handleCloseMovie();
      fetchMoveis();

      return function ()
      {
        controller.abort();
      }

    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>

        <Box >
          {isLoging && <Loader />}
          {!isLoging && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetals
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatch}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeletWatched={handleDeleteWatched} />{" "}
            </>
          )}
        </Box>
      </Main >
    </>
  );
}

function Loader()
{
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message })
{
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

function NavBar({ children })
{
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo()
{
  return (
    <div className="logo">
      <img src="../popcorn-logo.png" alt="logo" />
      <h1>Popcorn</h1>
    </div>
  );
}

function Search({ query, setQuery })
{
  useEffect(function ()
  {
    const el = document.querySelector('.search');
    el.focus();
  }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies })
{
  return (
    <p className="num-results">
      Found <strong>{movies && movies.length}</strong> results
    </p>
  );
}

function Main({ children })
{
  return <main className="main">{children}</main>;
}

function Box({ children })
{
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie })
{
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie })
{
  return (
    <li className="listOfMovie" onClick={() => onSelectMovie(movie.imdbID)}>
      <img className="movieResultImg" src={movie.Poster} alt={`${movie.Title} poster`} />

      <div className="text">
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </div>
    </li>
  );
}

function MovieDetals({ selectedId, onCloseMovie, onAddWatched, watched })
{
  const [movie, setMovie] = useState({});
  const [isLoging, setIsLoging] = useState(false);
  const [userRating, setUserRating] = useState();

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.userRating;


  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd()
  {
    const newWatchesMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatched(newWatchesMovie);

  }



  useEffect(function ()
  {
    function callback(e)
    {
      if (e.code === "Escape")
      {
        onCloseMovie();
      }
    }
    document.addEventListener('keydown', callback);

    return function ()
    {
      document.removeEventListener('keydown', callback);
    }
  }, [onCloseMovie]);


  useEffect(
    function ()
    {
      async function getMovieDetails()
      {
        setIsLoging(true);

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoging(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );


  useEffect(function ()
  {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return function ()
    {
      document.title = "usePopcorn";
    }

  }, [title]);

  return (
    <div className="details">
      {isLoging ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>

            {!poster ? (
              "🍿"
            ) : (
              <img src={poster} alt={`poster of ${movie} movie`} />
            )}

            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>🌟</span>
                {imdbRating} IMDB Reting
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? <> <StaticRange
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              />
                {userRating > 0 && (
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to List
                  </button>
                )}</> : <p>You Rated This Movie {watchedUserRating} <span>⭐</span></p>}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed By {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched })
{
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeletWatched })
{
  return (
    <div className="mySaveMoive">
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMovie movie={movie} key={movie.imdbID} onDeletWatched={onDeletWatched} />
        ))}
      </ul>
    </div>
  );
}

function WatchedMovie({ movie, onDeletWatched })
{
  return (

    <li className="listOfMovie">
      <img className="movieResultImg" src={movie.poster} alt={`${movie.title} poster`} />
      <div className="text">
        <h3>{movie.title}</h3>
        <div className="reslults">
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>

        </div>
      </div>

      <button className="btn-delete" onClick={() => onDeletWatched(movie.imdbID)}>Delete of my list</button>
    </li>
  );
}