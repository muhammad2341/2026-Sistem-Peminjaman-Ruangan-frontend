import React, { useState } from "react";
import { BookingManagementDashboard } from "./components/BookingManagementDashboard";
import { RoomList } from "./components/RoomList";
import "./App.css";

function App() {
  const [view, setView] = useState<"rooms" | "dashboard">("rooms");

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-inner">
          <h1 className="App-title">Room Booking System</h1>
          <nav className="App-nav" aria-label="Primary">
            <button
              type="button"
              className={`App-nav-button ${view === "rooms" ? "active" : ""}`}
              onClick={() => setView("rooms")}
            >
              Rooms
            </button>
            <button
              type="button"
              className={`App-nav-button ${
                view === "dashboard" ? "active" : ""
              }`}
              onClick={() => setView("dashboard")}
            >
              Booking Dashboard
            </button>
          </nav>
        </div>
      </header>
      <main className="App-main">
        {view === "rooms" ? <RoomList /> : <BookingManagementDashboard />}
      </main>
    </div>
  );
}

export default App;
