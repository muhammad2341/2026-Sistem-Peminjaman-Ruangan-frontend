import React, { useEffect, useMemo, useState } from "react";
import { apiService, Room } from "../services/api";
import "../styles/BookingForm.css";

type FormState = {
  roomId: string;
  bookerName: string;
  bookerEmail: string;
  bookerPhone: string;
  purpose: string;
  startTime: string;
  endTime: string;
};

type BookingFormProps = {
  preselectedRoomId?: number | null;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const initialState: FormState = {
  roomId: "",
  bookerName: "",
  bookerEmail: "",
  bookerPhone: "",
  purpose: "",
  startTime: "",
  endTime: "",
};

function toIsoDateString(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}

export const BookingForm: React.FC<BookingFormProps> = ({
  preselectedRoomId,
  onCancel,
  onSuccess,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(initialState);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        setError(null);
        const data = await apiService.getRooms({ page: 1, pageSize: 100 });
        const availableRooms = data.filter((room) => room.isAvailable);
        setRooms(availableRooms);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch rooms");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (preselectedRoomId) {
      setForm((prev) => ({ ...prev, roomId: String(preselectedRoomId) }));
    }
  }, [preselectedRoomId]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === form.roomId),
    [form.roomId, rooms],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.roomId) return "Silakan pilih ruangan.";
    if (!form.bookerName.trim()) return "Nama peminjam wajib diisi.";
    if (!form.bookerEmail.trim()) return "Email peminjam wajib diisi.";
    if (!/^\S+@\S+\.\S+$/.test(form.bookerEmail)) {
      return "Format email tidak valid.";
    }
    if (!form.purpose.trim()) return "Tujuan booking wajib diisi.";
    if (!form.startTime) return "Waktu mulai wajib diisi.";
    if (!form.endTime) return "Waktu selesai wajib diisi.";

    const start = new Date(form.startTime).getTime();
    const end = new Date(form.endTime).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) {
      return "Format waktu tidak valid.";
    }

    if (end <= start) {
      return "Waktu selesai harus lebih besar dari waktu mulai.";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await apiService.createBooking({
        roomId: Number(form.roomId),
        bookerName: form.bookerName.trim(),
        bookerEmail: form.bookerEmail.trim(),
        bookerPhone: form.bookerPhone.trim() || undefined,
        purpose: form.purpose.trim(),
        startTime: toIsoDateString(form.startTime),
        endTime: toIsoDateString(form.endTime),
      });

      setSuccessMessage("Booking berhasil dibuat dengan status Pending.");
      setForm((prev) => ({
        ...initialState,
        roomId: preselectedRoomId ? String(preselectedRoomId) : "",
      }));

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingRooms) {
    return <div className="booking-form-loading">Memuat data ruangan...</div>;
  }

  return (
    <div className="booking-form-container">
      <h1>Booking Form</h1>
      <p className="booking-form-subtitle">
        Isi form berikut untuk mengajukan peminjaman ruangan.
      </p>

      {error && (
        <div className="booking-form-alert booking-form-error" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="booking-form-alert booking-form-success" role="status">
          {successMessage}
        </div>
      )}

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="booking-form-grid">
          <div className="booking-form-field">
            <label htmlFor="roomId">Ruangan</label>
            <select
              id="roomId"
              value={form.roomId}
              onChange={(e) => updateField("roomId", e.target.value)}
            >
              <option value="">-- Pilih Ruangan --</option>
              {rooms.map((room) => (
                <option key={room.id} value={String(room.id)}>
                  {room.roomNumber} - {room.name} (Kapasitas {room.capacity})
                </option>
              ))}
            </select>
            {selectedRoom && (
              <small className="booking-form-hint">
                Fasilitas: {selectedRoom.facilities || "-"}
              </small>
            )}
          </div>

          <div className="booking-form-field">
            <label htmlFor="bookerName">Nama Peminjam</label>
            <input
              id="bookerName"
              type="text"
              value={form.bookerName}
              onChange={(e) => updateField("bookerName", e.target.value)}
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div className="booking-form-field">
            <label htmlFor="bookerEmail">Email Peminjam</label>
            <input
              id="bookerEmail"
              type="email"
              value={form.bookerEmail}
              onChange={(e) => updateField("bookerEmail", e.target.value)}
              placeholder="contoh@email.com"
            />
          </div>

          <div className="booking-form-field">
            <label htmlFor="bookerPhone">No. HP (opsional)</label>
            <input
              id="bookerPhone"
              type="tel"
              value={form.bookerPhone}
              onChange={(e) => updateField("bookerPhone", e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="booking-form-field booking-form-field-full">
            <label htmlFor="purpose">Tujuan Peminjaman</label>
            <textarea
              id="purpose"
              rows={4}
              value={form.purpose}
              onChange={(e) => updateField("purpose", e.target.value)}
              placeholder="Jelaskan kegiatan yang akan dilakukan"
            />
          </div>

          <div className="booking-form-field">
            <label htmlFor="startTime">Waktu Mulai</label>
            <input
              id="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => updateField("startTime", e.target.value)}
            />
          </div>

          <div className="booking-form-field">
            <label htmlFor="endTime">Waktu Selesai</label>
            <input
              id="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => updateField("endTime", e.target.value)}
            />
          </div>
        </div>

        <div className="booking-form-actions">
          {onCancel && (
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Batal
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Ajukan Booking"}
          </button>
        </div>
      </form>
    </div>
  );
};
