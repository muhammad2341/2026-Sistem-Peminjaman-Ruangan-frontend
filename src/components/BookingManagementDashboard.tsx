import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiService, Booking } from "../services/api";
import "../styles/BookingManagementDashboard.css";

type StatusFilter = "All" | Booking["status"];

type ActionType = "approve" | "reject" | "cancel";

type ModalState =
  | { open: false }
  | {
      open: true;
      action: ActionType;
      booking: Booking;
    };

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function toStatusClass(status: Booking["status"]): string {
  return status.toLowerCase();
}

export const BookingManagementDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [roomIdFilter, setRoomIdFilter] = useState<number | "All">("All");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const params = useMemo(() => {
    return {
      search: search.trim() ? search.trim() : undefined,
      status: statusFilter === "All" ? undefined : statusFilter,
      roomId: roomIdFilter === "All" ? undefined : roomIdFilter,
      page,
      pageSize,
    };
  }, [page, pageSize, roomIdFilter, search, statusFilter]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBookings(params);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const availableRoomOptions = useMemo(() => {
    const map = new Map<number, { roomName: string; roomNumber: string }>();
    for (const b of bookings) {
      if (!map.has(b.roomId)) {
        map.set(b.roomId, {
          roomName: b.roomName,
          roomNumber: b.roomNumber,
        });
      }
    }
    return Array.from(map.entries())
      .map(([roomId, v]) => ({ roomId, ...v }))
      .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [bookings]);

  function openApprove(b: Booking) {
    setModal({ open: true, action: "approve", booking: b });
  }

  function openReject(b: Booking) {
    setRejectReason("");
    setModal({ open: true, action: "reject", booking: b });
  }

  function openCancel(b: Booking) {
    setModal({ open: true, action: "cancel", booking: b });
  }

  function closeModal() {
    setModal({ open: false });
    setRejectReason("");
  }

  async function submitAction() {
    if (!modal.open) return;

    const booking = modal.booking;

    try {
      setUpdating(true);

      if (modal.action === "approve") {
        await apiService.updateBookingStatus(booking.id, {
          status: "Approved",
        });
      }

      if (modal.action === "cancel") {
        await apiService.updateBookingStatus(booking.id, {
          status: "Cancelled",
        });
      }

      if (modal.action === "reject") {
        const reason = rejectReason.trim();
        if (!reason) {
          setError("Rejection reason is required");
          return;
        }
        await apiService.updateBookingStatus(booking.id, {
          status: "Rejected",
          rejectionReason: reason,
        });
      }

      closeModal();
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setUpdating(false);
    }
  }

  function onSubmitFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  return (
    <div className="booking-dashboard-container">
      <div className="booking-dashboard-header">
        <h1>Booking Management</h1>
        <p className="booking-dashboard-subtitle">
          Review booking requests and approve/reject/cancel.
        </p>
      </div>

      <form className="booking-filters" onSubmit={onSubmitFilters}>
        <input
          type="text"
          placeholder="Search by booker, email, purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="booking-filter-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="booking-filter-select"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={roomIdFilter === "All" ? "All" : String(roomIdFilter)}
          onChange={(e) =>
            setRoomIdFilter(
              e.target.value === "All" ? "All" : Number(e.target.value),
            )
          }
          className="booking-filter-select"
        >
          <option value="All">All Rooms</option>
          {availableRoomOptions.map((r) => (
            <option key={r.roomId} value={String(r.roomId)}>
              {r.roomNumber} — {r.roomName}
            </option>
          ))}
        </select>

        <button type="submit" className="booking-filter-button">
          Apply
        </button>
      </form>

      {loading && <div className="booking-loading">Loading bookings...</div>}

      {error && (
        <div className="booking-error">
          <p>Error: {error}</p>
          <button onClick={fetchBookings} className="booking-secondary-button">
            Retry
          </button>
        </div>
      )}

      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Booker</th>
              <th>Room</th>
              <th>Purpose</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th className="booking-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="booking-empty">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="booker-name">{b.bookerName}</div>
                    <div className="booker-email">{b.bookerEmail}</div>
                  </td>
                  <td>
                    <div className="room-main">{b.roomNumber}</div>
                    <div className="room-sub">{b.roomName}</div>
                  </td>
                  <td className="purpose">{b.purpose}</td>
                  <td>{formatDateTime(b.startTime)}</td>
                  <td>{formatDateTime(b.endTime)}</td>
                  <td>
                    <span className={`status-badge ${toStatusClass(b.status)}`}>
                      {b.status}
                    </span>
                    {b.status === "Rejected" && b.rejectionReason ? (
                      <div className="rejection-reason">
                        {b.rejectionReason}
                      </div>
                    ) : null}
                  </td>
                  <td className="booking-actions">
                    <button
                      className="booking-primary-button"
                      onClick={() => openApprove(b)}
                      disabled={b.status !== "Pending"}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="booking-danger-button"
                      onClick={() => openReject(b)}
                      disabled={b.status !== "Pending"}
                      type="button"
                    >
                      Reject
                    </button>
                    <button
                      className="booking-secondary-button"
                      onClick={() => openCancel(b)}
                      disabled={b.status === "Cancelled"}
                      type="button"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="booking-pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="booking-secondary-button"
          type="button"
        >
          Previous
        </button>
        <span className="booking-page-info">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={bookings.length < pageSize}
          className="booking-secondary-button"
          type="button"
        >
          Next
        </button>
      </div>

      {modal.open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {modal.action === "approve" && "Approve booking"}
                {modal.action === "reject" && "Reject booking"}
                {modal.action === "cancel" && "Cancel booking"}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={updating}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-summary">
                <div>
                  <strong>Booker:</strong> {modal.booking.bookerName}
                </div>
                <div>
                  <strong>Room:</strong> {modal.booking.roomNumber} —{" "}
                  {modal.booking.roomName}
                </div>
                <div>
                  <strong>Time:</strong>{" "}
                  {formatDateTime(modal.booking.startTime)}
                  {" — "}
                  {formatDateTime(modal.booking.endTime)}
                </div>
              </div>

              {modal.action === "reject" ? (
                <div className="modal-field">
                  <label htmlFor="rejectReason" className="modal-label">
                    Rejection reason
                  </label>
                  <textarea
                    id="rejectReason"
                    className="modal-textarea"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Write a clear reason for rejection..."
                    rows={3}
                    disabled={updating}
                  />
                </div>
              ) : (
                <p className="modal-confirm-text">
                  Are you sure you want to {modal.action} this booking?
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="booking-secondary-button"
                onClick={closeModal}
                disabled={updating}
              >
                Close
              </button>
              <button
                type="button"
                className={
                  modal.action === "reject"
                    ? "booking-danger-button"
                    : "booking-primary-button"
                }
                onClick={submitAction}
                disabled={updating}
              >
                {updating ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
