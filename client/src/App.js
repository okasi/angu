import React, { useEffect, useState } from "react";
// import logo from "./logo.svg";
import "./App.css";
import { JsonToTable } from "react-json-to-table";

function App() {
  const [bets, setBets] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  useEffect(() => {
    (async function() {
      let resData = null;
      resData = await (await fetch("http://localhost:8080/bets")).json();
      setBets(resData);
      resData = await (await fetch("http://localhost:8080/lastupdate")).json();
      setLastUpdate(Object.values(resData)[0]);
    })();
  }, []);
  return (
    <div>
      <header
        className="App-header"
        style={{
          color: "black",
          backgroundColor: "#2d2d2d",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg
          width="256"
          height="256"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M45 2C43.8945 2 43 2.89453 43 4C43 4.29297 43.0742 4.5625 43.1875 4.8125L35.1875 16C35.125 15.9961 35.0625 16 35 16C34.6016 16 34.2188 16.1094 33.9062 16.3125L27 12.875C26.9336 11.8281 26.0625 11 25 11C23.8945 11 23 11.8945 23 13C23 13.1055 23.0156 13.2109 23.0312 13.3125L15.7188 19.125C15.4961 19.0391 15.2539 19 15 19C14 19 13.1797 19.7305 13.0312 20.6875L6.21875 23.4375C5.87891 23.1719 5.46094 23 5 23C3.89453 23 3 23.8945 3 25C3 26.1055 3.89453 27 5 27C6.00781 27 6.83203 26.2539 6.96875 25.2812L13.7812 22.5625C14.1211 22.8281 14.5391 23 15 23C16.1055 23 17 22.1055 17 21C17 20.8945 16.9844 20.7891 16.9688 20.6875L24.2812 14.875C24.5039 14.9609 24.7461 15 25 15C25.3984 15 25.7812 14.8906 26.0938 14.6875L33 18.125C33.0664 19.1719 33.9375 20 35 20C36.1055 20 37 19.1055 37 18C37 17.707 36.9258 17.4375 36.8125 17.1875L44.8125 6C44.875 6.00391 44.9375 6 45 6C46.1055 6 47 5.10547 47 4C47 2.89453 46.1055 2 45 2ZM41 15V50H49V15H41ZM21 24V50H29V24H21ZM31 29V50H39V29H31ZM11 32V50H19V32H11ZM1 36V50H9V36H1Z"
            fill="white"
          />
        </svg>

        <h1 style={{ fontSize: "6rem", color: "white" }}>angu</h1>
        <h3 style={{ fontSize: "3rem", color: "white" }}>
          Last updated: {lastUpdate}
        </h3>
        <div style={{ backgroundColor: "#cccccc" }}>
          <JsonToTable json={bets} style />
        </div>
      </header>
    </div>
  );
}

export default App;
