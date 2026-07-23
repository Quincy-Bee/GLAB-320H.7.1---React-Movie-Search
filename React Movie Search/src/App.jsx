import { useEffect, useState } from "react";

// bring in environemnt variable

const API_KEY = import.meta.env.VITE_API_KEY;

console.log(API_KEY);

export default function App() {

  const [movie, setMovie] = useState(null);

  // takes two arguements:
  // 1st is a setup function (callback function)
  // 2nd is a dependency list (array)
  useEffect(() => {

    // communicate with some external system (ex: The movie API)
    async function getMovie() {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=Alien`
);
      const data = await response.json();
      setMovie(data);
    }

    getMovie();

  }, [])

  console.log(movie);

return (
  <div>
    {movie && (
      <>
        <h1>{movie.Title}</h1>
        <h2>{movie.Genre}</h2>
        <img src={movie.Poster} alt={movie.Title} />
        <h2>{movie.Year}</h2>
      </>
    )}
  </div>
);


}
