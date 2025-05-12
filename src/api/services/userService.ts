/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/users/services/userService' instead.
 * 
 * WARNING: This is only a redirect to avoid breaking code that still imports from this location.
 * You should update your imports to use the module-specific implementation directly.
 */

import { userService } from '@/modules/users/services/userService';
import { UserFilters } from '@/types/user';

// Re-export the main userService for backward compatibility
export { userService };

/**
 * Simplified redirect API that forwards all calls to the main userService
 * This ensures all API calls use the same endpoint patterns and reduces duplication
 */
export const userApi = {
  // User management
  getUsers: userService.getUsers,
  getUser: userService.getUser,
  createUser: userService.createUser,
  updateUser: userService.updateUser,
  deleteUser: userService.deleteUser,
  getCurrentUser: userService.getCurrentUser,
  getUserAnalytics: userService.getUserAnalytics,
  exportUsers: userService.exportUsers,
  
  // Profile management
  getProfiles: userService.getProfiles,
  getProfile: userService.getProfile,
  getUserProfile: userService.getUserProfile,
  updateUserProfile: userService.updateUserProfile,
  updateProfile: userService.updateProfile,
  // Adding deleteProfile to match the expected interface
  deleteProfile: (token: string, id: string | number) => userService.delete(`/api/users/profiles/${id}/`, token),
  
  // Group management
  getGroups: userService.getGroups,
  getGroup: userService.getGroup,
  createGroup: userService.createGroup,
  updateGroup: userService.updateGroup,
  deleteGroup: userService.deleteGroup,
  
  // Wallet management functions that were removed
  getWallets: (token: string, search = '') => {
    return userService.get('/api/users/wallets/', token, { search });
  },
  
  getWallet: (token: string, id: string | number) => {
    return userService.get(`/api/users/wallets/${id}/`, token);
  },
  
  createWallet: (token: string, data: any) => {
    return userService.post('/api/users/wallets/', data, token);
  },
  
  updateWallet: (token: string, id: string | number, data: any) => {
    return userService.put(`/api/users/wallets/${id}/`, data, token);
  },
  
  deleteWallet: (token: string, id: string | number) => {
    return userService.delete(`/api/users/wallets/${id}/`, token);
  },
  
  depositToWallet: (token: string, walletId: string | number, data: any) => {
    return userService.post(`/api/users/wallets/${walletId}/deposit/`, data, token);
  },
  
  withdrawFromWallet: (token: string, walletId: string | number, data: any) => {
    return userService.post(`/api/users/wallets/${walletId}/withdraw/`, data, token);
  },
  
  // Communication management
  updatePhone: userService.updatePhone,
  updateEmail: userService.updateEmail,
  verifyUpdate: userService.verifyUpdate,
  
  // Payment methods
  paytmPayment: userService.paytmPayment,
  paytmCallback: userService.paytmCallback,
  paytmWebhook: userService.paytmWebhook
};
