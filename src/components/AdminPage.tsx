import React, { useState } from "react";
import { BookingHistory } from "./BookingHistory";
import { BookingManagementDashboard } from "./BookingManagementDashboard";
import { RoomList } from "./RoomList";

type AdminView = "dashboard" | "rooms" | "history";

type AdminPageProps = {
  displayName: string;
  onLogout: () => void;
};

export const AdminPage: React.FC<AdminPageProps> = ({
  displayName,
  onLogout,
}) => {
  const [view, setView] = useState<AdminView>("dashboard");

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-inner">
          <h1 className="App-title">Admin Panel - {displayName}</h1>
          <nav className="App-nav" aria-label="Admin Navigation">
            <button
              type="button"
              className={`App-nav-button ${view === "dashboard" ? "active" : ""}`}
              onClick={() => setView("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`App-nav-button ${view === "rooms" ? "active" : ""}`}
              onClick={() => setView("rooms")}
            >
              Rooms
            </button>
            <button
              type="button"
              className={`App-nav-button ${view === "history" ? "active" : ""}`}
              onClick={() => setView("history")}
            >
              Booking History
            </button>
            <button type="button" className="App-nav-button" onClick={onLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="App-main">
        {view === "dashboard" && <BookingManagementDashboard />}
        {view === "rooms" && <RoomList />}
        {view === "history" && <BookingHistory />}
      </main>
    </div>
  );
};
