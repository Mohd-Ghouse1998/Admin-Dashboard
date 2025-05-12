import axiosInstance from "@/api/axios";

// Interface for paginated API responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface for User Profile
export interface UserProfile {
  phone_number?: string;
  city?: string;
  state?: string;
  pin?: string;
  address?: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  ocpi_party_id?: string | null;
  ocpi_role?: string | null;
  ocpi_token?: string | null;
}

// Interface for User
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile | null;
}

export const userService = {
  // Get all users with pagination
  getUsers: async () => {
    try {
      const response = await axiosInstance.get<PaginatedResponse<User>>("/users/users/");
      console.log("API Response for users:", response);
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get a specific user by ID
  getUser: async (userId: number) => {
    try {
      return await axiosInstance.get<User>(`/users/users/${userId}/`);
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Get current user - special case that needs to keep the duplicated path
  getCurrentUser: async () => {
    try {
      return await axiosInstance.get<User>("/users/users/me/");
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },
  
  // Create a new user
  createUser: async (userData: Partial<User>) => {
    try {
      return await axiosInstance.post<User>("/users/users/", userData);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  
  // Update an existing user
  updateUser: async (userId: number, userData: Partial<User>) => {
    try {
      return await axiosInstance.put<User>(`/users/users/${userId}/`, userData);
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
  
  // Delete a user
  deleteUser: async (userId: number) => {
    try {
      await axiosInstance.delete(`/users/users/${userId}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Get user profiles
  getUserProfiles: async () => {
    try {
      return await axiosInstance.get<PaginatedResponse<UserProfile>>("/users/profiles/");
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      throw error;
    }
  },
};

export default userService;
