import React, { useState } from "react";
import { BookingForm } from "./components/BookingForm";
import { BookingManagementDashboard } from "./components/BookingManagementDashboard";
import { RoomList } from "./components/RoomList";
import "./App.css";

function App() {
  const [view, setView] = useState<"rooms" | "bookingForm" | "dashboard">(
    "rooms",
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  function handleOpenBookingForm(roomId?: number) {
    if (roomId) {
      setSelectedRoomId(roomId);
    }
    setView("bookingForm");
  }

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
                view === "bookingForm" ? "active" : ""
              }`}
              onClick={() => handleOpenBookingForm()}
            >
              Booking Form
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
        {view === "rooms" && <RoomList onBookRoom={handleOpenBookingForm} />}
        {view === "bookingForm" && (
          <BookingForm
            preselectedRoomId={selectedRoomId}
            onCancel={() => setView("rooms")}
            onSuccess={() => setView("dashboard")}
          />
        )}
        {view === "dashboard" && <BookingManagementDashboard />}
      </main>
    </div>
  );
}

export default App;
