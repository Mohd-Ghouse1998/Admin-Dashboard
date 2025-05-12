import { Route } from "react-router-dom";

// User management pages
import UsersListPage from "@/modules/users/pages/users/UsersListPage";
import UserCreatePage from "@/modules/users/pages/users/UserCreatePage";
import UserEditPage from "@/modules/users/pages/users/UserEditPage";
import UserDetailPage from "@/modules/users/pages/users/UserDetailPage";

// Profile management pages
import ProfilesListPage from "@/modules/users/pages/profiles/ProfilesListPage";
import ProfileDetailPage from "@/modules/users/pages/profiles/ProfileDetailPage";
import ProfileEditPage from "@/modules/users/pages/profiles/ProfileEditPage";
import ProfileCreatePage from "@/modules/users/pages/profiles/ProfileCreatePage";

// Group management pages
import GroupsListPage from "@/modules/users/pages/groups/GroupsListPage";
import GroupCreatePage from "@/modules/users/pages/groups/GroupCreatePage";
import GroupEditPage from "@/modules/users/pages/groups/GroupEditPage";
import GroupDetailPage from "@/modules/users/pages/groups/GroupDetailPage";

// Permission management pages
import {
  PermissionsListPage,
  PermissionDetailPage,
  PermissionCreatePage,
  PermissionEditPage,
  UserPermissionsPage,
  MyPermissionsPage
} from "@/modules/users/pages/permissions";

// Wallet management pages
import {
  WalletsListPage,
  WalletCreatePage,
  WalletEditPage,
  WalletDetailPage
} from "@/modules/users/pages/wallets";

// Import plan pages
import {
  PlansListPage,
  PlanCreatePage,
  PlanDetailPage,
  PlanEditPage
} from "@/modules/users/pages/plans";

// Import plan users pages
import {
  PlanUsersListPage,
  PlanUserCreatePage,
  PlanUserDetailPage,
  PlanUserEditPage
} from "@/modules/users/pages/plan-users";

// Import session billings pages
import {
  SessionBillingsListPage,
  SessionBillingCreatePage,
  SessionBillingDetailPage,
  SessionBillingEditPage
} from "@/modules/users/pages/session-billings";

// Import promotions pages
import {
  PromotionsListPage,
  PromotionCreatePage,
  PromotionDetailPage,
  PromotionEditPage
} from "@/modules/users/pages/promotions";

export const userRoutes = (
  <Route path="users">
    {/* Index route for /users */}
    <Route index element={<UsersListPage />} />
    
    {/* User routes */}
    <Route path="create" element={<UserCreatePage />} />
    <Route path=":id" element={<UserDetailPage />} />
    <Route path=":id/edit" element={<UserEditPage />} />
    <Route path=":id/permissions" element={<UserPermissionsPage />} />
    
    {/* Group routes */}
    <Route path="groups" element={<GroupsListPage />} />
    <Route path="groups/create" element={<GroupCreatePage />} />
    <Route path="groups/:id" element={<GroupDetailPage />} />
    <Route path="groups/:id/edit" element={<GroupEditPage />} />
    
    {/* Permission routes */}
    <Route path="permissions" element={<PermissionsListPage />} />
    <Route path="permissions/create" element={<PermissionCreatePage />} />
    <Route path="permissions/:id" element={<PermissionDetailPage />} />
    <Route path="permissions/:id/edit" element={<PermissionEditPage />} />
    <Route path="my-permissions" element={<MyPermissionsPage />} />
    
    {/* Wallet routes */}
    <Route path="wallets" element={<WalletsListPage />} />
    <Route path="wallets/create" element={<WalletCreatePage />} />
    <Route path="wallets/:id" element={<WalletDetailPage />} />
    <Route path="wallets/:id/edit" element={<WalletEditPage />} />
    
    {/* Plan routes */}
    <Route path="plans" element={<PlansListPage />} />
    <Route path="plans/create" element={<PlanCreatePage />} />
    <Route path="plans/:id" element={<PlanDetailPage />} />
    <Route path="plans/:id/edit" element={<PlanEditPage />} />
    
    {/* Plan Users routes */}
    <Route path="plan-users" element={<PlanUsersListPage />} />
    <Route path="plan-users/create" element={<PlanUserCreatePage />} />
    <Route path="plan-users/:id" element={<PlanUserDetailPage />} />
    <Route path="plan-users/:id/edit" element={<PlanUserEditPage />} />
    
    {/* Session Billings routes */}
    <Route path="session-billings" element={<SessionBillingsListPage />} />
    <Route path="session-billings/create" element={<SessionBillingCreatePage />} />
    <Route path="session-billings/:id" element={<SessionBillingDetailPage />} />
    <Route path="session-billings/:id/edit" element={<SessionBillingEditPage />} />
    
    {/* Promotions routes */}
    <Route path="promotions" element={<PromotionsListPage />} />
    <Route path="promotions/create" element={<PromotionCreatePage />} />
    <Route path="promotions/:id" element={<PromotionDetailPage />} />
    <Route path="promotions/:id/edit" element={<PromotionEditPage />} />
    
    {/* Profile routes */}
    <Route path="profiles" element={<ProfilesListPage />} />
    <Route path="profiles/create" element={<ProfileCreatePage />} />
    <Route path="profiles/:id" element={<ProfileDetailPage />} />
    <Route path="profiles/:id/edit" element={<ProfileEditPage />} />
    <Route path="user_profile" element={<ProfileDetailPage />} />
    <Route path="user_profile/edit" element={<ProfileEditPage />} />
  </Route>
);
