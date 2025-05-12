
import { apiService } from '@/services/api';

export interface OTP {
  id: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
  otp_type: 'email' | 'phone' | 'two_factor';
  is_verified: boolean;
  created_at: string;
  expires_at: string;
}

export const otpService = {
  // Get all OTPs with optional pagination
  getOTPs: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/api/users/otps/?page=${page}` : '/api/users/otps/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching OTPs:', error);
      throw error;
    }
  },

  // Get a specific OTP by ID
  getOTP: async (accessToken: string, id: string) => {
    try {
      return await apiService.get(`/api/users/otps/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching OTP ${id}:`, error);
      throw error;
    }
  },

  // Delete an OTP
  deleteOTP: async (accessToken: string, id: string) => {
    try {
      return await apiService.delete(`/api/users/otps/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting OTP ${id}:`, error);
      throw error;
    }
  },

  // Send a new OTP
  sendOTP: async (accessToken: string, type: 'email' | 'phone' | 'two_factor') => {
    try {
      return await apiService.post('/api/users/send_otp/', { type }, accessToken);
    } catch (error) {
      console.error(`Error sending ${type} OTP:`, error);
      throw error;
    }
  },

  // Verify an OTP
  verifyOTP: async (accessToken: string, otp: string, type: 'email' | 'phone' | 'two_factor') => {
    try {
      return await apiService.post('/api/users/verify_otp/', { otp, type }, accessToken);
    } catch (error) {
      console.error(`Error verifying OTP:`, error);
      throw error;
    }
  }
};
