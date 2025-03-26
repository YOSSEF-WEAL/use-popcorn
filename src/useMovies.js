import { useEffect, useState } from "react";
const KEY = "2ef73cfc";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoging, setIsLoging] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      callback?.();

      const controller = new AbortController();
      async function fetchMoveis() {
        try {
          setIsLoging(true);
          setError("");

          const res = await fetch(
            `https://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies ");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (error) {
          if (error !== "AbortError") {
            console.error(error.message);
            setError(error.message);
          }
        } finally {
          setIsLoging(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMoveis();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoging, error };
}
