import { useEffect, useState } from "react";

export function useLocalStorageState(initalStat, key) {
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem(`${key}`);
    return storedValue ? JSON.parse(storedValue) : initalStat;
  });

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
