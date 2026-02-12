import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiService, Booking } from "../services/api";
import "../styles/BookingHistory.css";

type StatusFilter = "All" | Booking["status"];

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusClass(status: Booking["status"]): string {
  return status.toLowerCase();
}

export const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [roomIdFilter, setRoomIdFilter] = useState<number | "All">("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const params = useMemo(
    () => ({
      search: search.trim() ? search.trim() : undefined,
      status: statusFilter === "All" ? undefined : statusFilter,
      roomId: roomIdFilter === "All" ? undefined : roomIdFilter,
      page,
      pageSize,
    }),
    [page, pageSize, roomIdFilter, search, statusFilter],
  );

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBookings(params);
      setBookings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data booking.",
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const roomOptions = useMemo(() => {
    const roomMap = new Map<number, { roomNumber: string; roomName: string }>();
    for (const booking of bookings) {
      if (!roomMap.has(booking.roomId)) {
        roomMap.set(booking.roomId, {
          roomNumber: booking.roomNumber,
          roomName: booking.roomName,
        });
      }
    }

    return Array.from(roomMap.entries())
      .map(([roomId, value]) => ({ roomId, ...value }))
      .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [bookings]);

  function onSubmitFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  return (
    <div className="booking-history-container">
      <div className="booking-history-header">
        <h1>Booking History & Search</h1>
        <p>
          Telusuri riwayat booking berdasarkan status, ruangan, atau kata kunci.
        </p>
      </div>

      <form className="booking-history-filters" onSubmit={onSubmitFilters}>
        <input
          type="text"
          className="booking-history-input"
          placeholder="Cari nama, email, tujuan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          className="booking-history-select"
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="All">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={roomIdFilter === "All" ? "All" : String(roomIdFilter)}
          className="booking-history-select"
          onChange={(e) =>
            setRoomIdFilter(
              e.target.value === "All" ? "All" : Number(e.target.value),
            )
          }
        >
          <option value="All">Semua Ruangan</option>
          {roomOptions.map((room) => (
            <option key={room.roomId} value={String(room.roomId)}>
              {room.roomNumber} - {room.roomName}
            </option>
          ))}
        </select>

        <button type="submit" className="booking-history-button">
          Cari
        </button>
      </form>

      {loading && <div className="booking-history-loading">Memuat data...</div>}

      {error && (
        <div className="booking-history-error">
          <p>Error: {error}</p>
          <button
            type="button"
            onClick={fetchBookings}
            className="booking-history-secondary"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="booking-history-table-wrapper">
        <table className="booking-history-table">
          <thead>
            <tr>
              <th>Peminjam</th>
              <th>Ruangan</th>
              <th>Tujuan</th>
              <th>Mulai</th>
              <th>Selesai</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="booking-history-empty">
                  Tidak ada data booking
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="booking-history-main">
                      {booking.bookerName}
                    </div>
                    <div className="booking-history-sub">
                      {booking.bookerEmail}
                    </div>
                  </td>
                  <td>
                    <div className="booking-history-main">
                      {booking.roomNumber}
                    </div>
                    <div className="booking-history-sub">
                      {booking.roomName}
                    </div>
                  </td>
                  <td className="booking-history-purpose">{booking.purpose}</td>
                  <td>{formatDateTime(booking.startTime)}</td>
                  <td>{formatDateTime(booking.endTime)}</td>
                  <td>
                    <span
                      className={`booking-history-status ${statusClass(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                    {booking.status === "Rejected" &&
                    booking.rejectionReason ? (
                      <div className="booking-history-reason">
                        {booking.rejectionReason}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="booking-history-pagination">
        <button
          type="button"
          className="booking-history-secondary"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          type="button"
          className="booking-history-secondary"
          disabled={bookings.length < pageSize}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
