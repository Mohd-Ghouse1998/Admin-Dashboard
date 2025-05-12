import axiosInstance from "@/api/axios";

// Interface for User Profile
export interface UserProfile {
  id: number;
  user: number;
  phone_number: string;
  city: string;
  state: string;
  pin: string;
  address: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  ocpi_party_id: string;
  ocpi_role: string;
  ocpi_token: string;
}

// Interface for paginated API responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const profileService = {
  // List all profiles - GET /api/users/profiles/
  getProfiles: async () => {
    try {
      console.log("DEBUG: Fetching profiles list");
      return await axiosInstance.get<PaginatedResponse<UserProfile>>('/users/profiles/');
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
  },

  // Get a specific profile by ID - GET /api/users/profiles/{id}/
  getProfile: async (profileId: number) => {
    try {
      console.log(`DEBUG: Fetching profile ${profileId}`);
      return await axiosInstance.get<UserProfile>(`/users/profiles/${profileId}/`);
    } catch (error) {
      console.error(`Error fetching profile ${profileId}:`, error);
      throw error;
    }
  },

  // Get current user's profile - GET /api/users/user_profile/
  getCurrentUserProfile: async () => {
    try {
      console.log("DEBUG: Fetching current user profile");
      return await axiosInstance.get<UserProfile>('/users/user_profile/');
    } catch (error) {
      console.error("Error fetching current user profile:", error);
      throw error;
    }
  },

  // Create a new profile - POST /api/users/profiles/
  createProfile: async (profileData: Partial<UserProfile>) => {
    try {
      console.log("DEBUG: Creating new profile");
      return await axiosInstance.post<UserProfile>('/users/profiles/', profileData);
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  },

  // Update an existing profile - PUT /api/users/profiles/{id}/
  updateProfile: async (profileId: number, profileData: Partial<UserProfile>) => {
    try {
      console.log(`DEBUG: Updating profile ${profileId}`);
      return await axiosInstance.put<UserProfile>(`/users/profiles/${profileId}/`, profileData);
    } catch (error) {
      console.error(`Error updating profile ${profileId}:`, error);
      throw error;
    }
  },

  // Update current user's profile - PUT /api/users/user_profile/
  updateCurrentUserProfile: async (profileData: Partial<UserProfile>) => {
    try {
      console.log("DEBUG: Updating current user profile");
      return await axiosInstance.put<UserProfile>('/users/user_profile/', profileData);
    } catch (error) {
      console.error("Error updating current user profile:", error);
      throw error;
    }
  },

  // Delete a profile - DELETE /api/users/profiles/{id}/
  deleteProfile: async (profileId: number) => {
    try {
      console.log(`DEBUG: Deleting profile ${profileId}`);
      await axiosInstance.delete(`/users/profiles/${profileId}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting profile ${profileId}:`, error);
      throw error;
    }
  }
};

export default profileService;
