import React, { useCallback, useEffect, useState } from "react";
import { apiService, Room } from "../services/api";
import "../styles/RoomList.css";

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRooms({
        search: search || undefined,
        page,
        pageSize,
      });
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (loading) {
    return <div className="loading">Loading rooms...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchRooms}>Retry</button>
      </div>
    );
  }

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h1>Available Rooms</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by room number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <div className="room-grid">
        {rooms.length === 0 ? (
          <p className="no-rooms">No rooms found</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-card-header">
                <h3>{room.name}</h3>
                <span
                  className={`status-badge ${
                    room.isAvailable ? "available" : "unavailable"
                  }`}
                >
                  {room.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="room-card-body">
                <p className="room-number">
                  <strong>Room:</strong> {room.roomNumber}
                </p>
                <p className="room-capacity">
                  <strong>Capacity:</strong> {room.capacity} people
                </p>
                {room.facilities && (
                  <p className="room-facilities">
                    <strong>Facilities:</strong> {room.facilities}
                  </p>
                )}
              </div>
              <div className="room-card-footer">
                <button className="btn-book" disabled={!room.isAvailable}>
                  {room.isAvailable ? "Book Now" : "Not Available"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-info">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={rooms.length < pageSize}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
