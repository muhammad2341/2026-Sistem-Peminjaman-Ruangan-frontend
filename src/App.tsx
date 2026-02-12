import React from "react";
import { RoomList } from "./components/RoomList";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Room Booking System</h1>
      </header>
      <main>
        <RoomList />
      </main>
    </div>
  );
}

export default App;
