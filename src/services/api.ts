const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5271/api";

export type UserRole = "Admin" | "Peminjam";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  displayName: string;
  role: UserRole;
  expiresInSeconds: number;
}

export interface Room {
  id: number;
  roomNumber: string;
  name: string;
  capacity: number;
  facilities: string | null;
  isAvailable: boolean;
  createdAt: string;
}

export interface Booking {
  id: number;
  roomId: number;
  roomNumber: string;
  roomName: string;
  bookerName: string;
  bookerEmail: string;
  bookerPhone: string | null;
  purpose: string;
  startTime: string;
  endTime: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  rejectionReason: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

class ApiService {
  private getStoredToken(): string | null {
    const raw = localStorage.getItem("room_booking_auth");
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as { token?: string };
      return parsed.token ?? null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const token = this.getStoredToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Room endpoints
  async getRooms(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<Room[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    return this.request<Room[]>(`/rooms?${queryParams.toString()}`);
  }

  async getRoom(id: number): Promise<Room> {
    return this.request<Room>(`/rooms/${id}`);
  }

  async createRoom(data: {
    roomNumber: string;
    name: string;
    capacity: number;
    facilities?: string;
    isAvailable?: boolean;
  }): Promise<Room> {
    return this.request<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRoom(
    id: number,
    data: {
      roomNumber: string;
      name: string;
      capacity: number;
      facilities?: string;
      isAvailable: boolean;
    },
  ): Promise<void> {
    await this.request<void>(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: number): Promise<void> {
    await this.request<void>(`/rooms/${id}`, {
      method: "DELETE",
    });
  }

  // Booking endpoints
  async getBookings(params?: {
    search?: string;
    status?: string;
    roomId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<Booking[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.roomId) queryParams.append("roomId", params.roomId.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    return this.request<Booking[]>(`/bookings?${queryParams.toString()}`);
  }

  async getBooking(id: number): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async createBooking(data: {
    roomId: number;
    bookerName: string;
    bookerEmail: string;
    bookerPhone?: string;
    purpose: string;
    startTime: string;
    endTime: string;
  }): Promise<Booking> {
    return this.request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBooking(
    id: number,
    data: {
      roomId: number;
      bookerName: string;
      bookerEmail: string;
      bookerPhone?: string;
      purpose: string;
      startTime: string;
      endTime: string;
    },
  ): Promise<void> {
    await this.request<void>(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateBookingStatus(
    id: number,
    data: {
      status: "Pending" | "Approved" | "Rejected" | "Cancelled";
      rejectionReason?: string;
    },
  ): Promise<void> {
    await this.request<void>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: number): Promise<void> {
    await this.request<void>(`/bookings/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
