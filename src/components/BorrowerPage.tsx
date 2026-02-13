import React, { useState } from "react";
import { BookingForm } from "./BookingForm";
import { BookingHistory } from "./BookingHistory";
import { RoomList } from "./RoomList";

type BorrowerView = "rooms" | "bookingForm" | "history";

type BorrowerPageProps = {
  displayName: string;
  onLogout: () => void;
};

export const BorrowerPage: React.FC<BorrowerPageProps> = ({
  displayName,
  onLogout,
}) => {
  const [view, setView] = useState<BorrowerView>("rooms");
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
          <h1 className="App-title">Portal Peminjam - {displayName}</h1>
          <nav className="App-nav" aria-label="Borrower Navigation">
            <button
              type="button"
              className={`App-nav-button ${view === "rooms" ? "active" : ""}`}
              onClick={() => setView("rooms")}
            >
              Rooms
            </button>
            <button
              type="button"
              className={`App-nav-button ${view === "bookingForm" ? "active" : ""}`}
              onClick={() => handleOpenBookingForm()}
            >
              Booking Form
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
        {view === "rooms" && <RoomList onBookRoom={handleOpenBookingForm} />}
        {view === "bookingForm" && (
          <BookingForm
            preselectedRoomId={selectedRoomId}
            onCancel={() => setView("rooms")}
            onSuccess={() => setView("history")}
          />
        )}
        {view === "history" && <BookingHistory />}
      </main>
    </div>
  );
};
