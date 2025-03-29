// Type definitions extending Express Request with auth user information
import 'express';

declare global {
  namespace Express {
    // Extend Request interface to include authenticated user
    interface Request {
      user?: {
        userId: string;
        email?: string;
        role: string;
        permissions?: string[];
        tenantId?: string;
      };
    }
  }
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Subscription types
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
export type PaymentStatus = 'succeeded' | 'failed' | 'pending';