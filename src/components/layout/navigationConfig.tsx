import React from "react";
import {
  Users,
  Building2,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Zap,
  Globe,
  UserRound,
  ShieldCheck,
  Wallet,
  Receipt,
  Tag,
  FileText,
  UserCog,
  Network,
  MapPin,
  KeyRound,
  LayoutDashboard,
  Gift,
  Calculator,
  ShoppingCart,
  User,
  Group,
  Edit,
  Plus,
  List,
  CheckCircle,
  Layers,
  Lock,
  Database,
  DollarSign,
  Terminal,
  BookOpen,
  Server,
  Radio,
  Plug,
  Activity,
  PlayCircle,
  StopCircle,
  UserCheck,
  Banknote,
  RefreshCcw,
  TicketCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  MessageCircle,
  AlertOctagon,
  BarChart,
  ExternalLink,
  Search,
} from "lucide-react";

// Define the type for navigation items
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ElementType;
  children?: NavItem[];
  requiresAdmin?: boolean;
  forceVisible?: boolean; // Force item visibility regardless of role
  role?: 'CPO' | 'EMSP'; // OCPI role-based visibility control
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'default';
  };
  // For section-based navigation
  isSection?: boolean; // Is this a section header
  parent?: string; // Parent section name for grouping
}

// Define the type for navigation sections
export interface NavSection {
  id: string;
  name: string;
  icon: React.ElementType;
  requiresAdmin?: boolean;
  forceExpanded?: boolean; // Added to force section to be expanded
  items: NavItem[];
}

// Navigation configuration
export const navigationConfig: NavSection[] = [
  // Dashboard
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  
  // User Management
  {
    id: "users",
    name: "User Management",
    icon: Users,
    items: [
      {
        name: "Users",
        href: "/users",
        icon: UserRound,
        children: [
          { name: "User List", href: "/users" },
          { name: "Create User", href: "/users/create" },
          { name: "User Details", href: "/users/:id" },
          { name: "Edit User", href: "/users/:id/edit" },
          { name: "Current User Profile", href: "/users/me" },
        ],
      },
      {
        name: "User Profiles",
        href: "/users/profiles",
        icon: UserCog,
        children: [
          { name: "Profile List", href: "/users/profiles" },
          { name: "Profile Details", href: "/users/profiles/:id" },
          { name: "My Profile", href: "/users/user_profile" },
        ],
      },
      {
        name: "Groups & Permissions",
        href: "/users/groups",
        icon: ShieldCheck,
        children: [
          { name: "Groups List", href: "/users/groups" },
          { name: "Group Details", href: "/users/groups/:id" },
          { name: "Group Users", href: "/users/groups/:id/users" },
          { name: "Group Permissions", href: "/users/groups/:id/permissions" },
          { name: "Create Group", href: "/users/groups/create" },
          { name: "Edit Group", href: "/users/groups/:id/edit" },
          { name: "User Permissions", href: "/users/users/:id/permissions" },
          { name: "My Permissions", href: "/users/my-permissions" },
        ],
      },
      {
        name: "Authentication Management",
        href: "/users/auth",
        icon: Lock,
        children: [
          { name: "Password Management", href: "/users/set_password" },
          { name: "Forgot Password", href: "/users/forgot_password" },
          { name: "OTP Verification", href: "/users/verify_otp" },
        ],
      },
      {
        name: "Device Management",
        href: "/users/devices",
        icon: Server,
        children: [
          { name: "User Devices", href: "/users/devices" },
        ],
      },
    ],
  },
  
  
  // Tenant Management
  {
    id: "tenant",
    name: "Tenant Management",
    icon: Building2,
    requiresAdmin: true,
    items: [
      {
        name: "Clients (Tenants)",
        href: "/tenants/clients",
        icon: Building2,
        children: [
          { name: "Client List", href: "/tenants/clients" },
          { name: "Client Details", href: "/tenants/clients/:id" },
          { name: "Create Client", href: "/tenants/clients/create" },
          { name: "Edit Client", href: "/tenants/clients/:id/edit" },
          { name: "Activate Client", href: "/tenants/clients/:id/activate" },
        ],
      },
      {
        name: "Tenant Configuration",
        href: "/tenants/config",
        icon: Settings,
        children: [
          { name: "Configuration List", href: "/tenants/config" },
          { name: "Edit Configuration", href: "/tenants/config/edit" },
        ],
      },
      {
        name: "Tenant Users",
        href: "/tenants/users",
        icon: Users,
        children: [
          { name: "Users List", href: "/tenants/users" },
          { name: "User Details", href: "/tenants/users/:id" },
          { name: "Create User", href: "/tenants/users/create" },
          { name: "User Groups", href: "/tenants/groups" },
        ],
      },
    ],
  },
  
  // Charging Infrastructure
  {
    id: "charging",
    name: "Charging Infrastructure",
    icon: Zap,
    items: [
      {
        name: "Chargers",
        href: "/chargers",
        icon: Zap,
        children: [
          { name: "Chargers Map", href: "/chargers/map" },
          { name: "Chargers List", href: "/chargers" },
          { name: "Charger Details", href: "/chargers/:id" },
          { name: "Add Charger", href: "/chargers/create" },
          { name: "Edit Charger", href: "/chargers/:id/edit" },
          { name: "Charger Status", href: "/chargers/:id/status" },
        ],
      },
      {
        name: "ID Tags / RFID Cards",
        href: "/chargers/id-tags",
        icon: Tag,
        children: [
          { name: "ID Tags List", href: "/chargers/id-tags" },
          { name: "ID Tag Details", href: "/chargers/id-tags/:id" },
          { name: "Create ID Tag", href: "/chargers/id-tags/create" },
          { name: "Edit ID Tag", href: "/chargers/id-tags/:id/edit" },
          { name: "Block/Unblock Tag", href: "/chargers/id-tags/:id/block" },
        ],
      },
      {
        name: "Charger Configuration",
        href: "/chargers/configs",
        icon: Settings,
        children: [
          { name: "Configuration Profiles", href: "/chargers/configs" },
          { name: "Create Profile", href: "/chargers/configs/create" },
          { name: "Edit Profile", href: "/chargers/configs/:id/edit" },
          { name: "Apply Configuration", href: "/chargers/configs/apply" },
          { name: "Remote Control", href: "/chargers/remote-control" },
          { name: "Charger Commands", href: "/chargers/commands" },
          { name: "Reset Charger", href: "/chargers/reset" },
          { name: "Set Charger Time", href: "/chargers/time" },
          { name: "Clear Cache", href: "/chargers/cache/clear" },
          { name: "Trigger Message", href: "/chargers/message/trigger" },
          { name: "Update Firmware", href: "/chargers/firmware/update" },
        ],
      },
      {
        name: "Meter Values",
        href: "/chargers/meter-values",
        icon: Activity,
        children: [
          { name: "List Meter Values", href: "/chargers/meter-values" },
          { name: "View Meter Value", href: "/chargers/meter-values/:id" },
        ],
      },
      {
        name: "Charger Connectors",
        href: "/chargers/connectors",
        icon: Plug,
        children: [
          { name: "List Connectors", href: "/chargers/connectors" },
          { name: "Connector Details", href: "/chargers/connectors/:id" },
          { name: "Create Connector", href: "/chargers/connectors/create" },
          { name: "Edit Connector", href: "/chargers/connectors/:id/edit" },
        ],
      },
      {
        name: "Remote Operations",
        href: "/chargers/remote-operations",
        icon: Settings,
        children: [
          { name: "Operations Dashboard", href: "/chargers/remote-operations" },
          { name: "Reset Charger", href: "/chargers/remote-operations/reset" },
          { name: "Get Configuration", href: "/chargers/remote-operations/get-config" },
          { name: "Set Configuration", href: "/chargers/remote-operations/set-config" },
          { name: "Clear Cache", href: "/chargers/remote-operations/clear-cache" },
          { name: "Change Availability", href: "/chargers/remote-operations/change-availability" },
          { name: "Trigger Diagnostics", href: "/chargers/remote-operations/trigger-message" },
          { name: "Firmware Update", href: "/chargers/remote-operations/update-firmware" },
        ],
      },
    ],
  },
  
  // Charging Sessions
  {
    id: "charging-sessions",
    name: "Charging Sessions",
    icon: PlayCircle,
    items: [
      {
        name: "All Sessions",
        href: "/chargers/charging-sessions",
        icon: FileText,
        children: [
          { name: "All Sessions List", href: "/chargers/charging-sessions" },
          { name: "Session Details", href: "/chargers/charging-sessions/:id" },
        ],
      },
      {
        name: "Active Sessions",
        href: "/chargers/active-sessions",
        icon: PlayCircle,
        children: [
          { name: "Active Sessions List", href: "/chargers/active-sessions" },
          { name: "Session Details", href: "/chargers/active-sessions/:id" },
        ],
      },
      {
        name: "Session History",
        href: "/chargers/sessions-history",
        icon: Clock,
        children: [
          { name: "Sessions History List", href: "/chargers/sessions-history" },
          { name: "Session Details", href: "/chargers/sessions-history/:id" },
        ],
      },
      {
        name: "Session Controls",
        href: "/chargers/session-controls",
        icon: RefreshCcw,
        children: [
          { name: "Start Transaction", href: "/chargers/session-controls/start" },
          { name: "Stop Transaction", href: "/chargers/session-controls/stop" },
        ],
      },
      {
        name: "Reservations",
        href: "/chargers/reservations",
        icon: TicketCheck,
        children: [
          { name: "Reservations List", href: "/chargers/reservations" },
          { name: "Create Reservation", href: "/chargers/reservations/create" },
          { name: "Reservation Details", href: "/chargers/reservations/:id" },
          { name: "Edit Reservation", href: "/chargers/reservations/:id/edit" },
          { name: "Cancel Reservation", href: "/chargers/reservations/:id/cancel" },
        ],
      },
      {
        name: "Usage Statistics",
        href: "/chargers/statistics",
        icon: TrendingUp,
        children: [
          { name: "Session Statistics", href: "/chargers/statistics" },
          { name: "User Statistics", href: "/chargers/statistics/users" },
          { name: "Charger Statistics", href: "/chargers/statistics/chargers" },
        ],
      },
    ],
  },
  
  // Payments & Billing
  {
    id: "payments-billing",
    name: "Payments & Billing",
    icon: CreditCard,
    items: [
      {
        name: "Pricing Plans",
        href: "/payment/plans",
        icon: DollarSign,
        children: [
          { name: "Plans List", href: "/payment/plans" },
          { name: "Create Plan", href: "/payment/plans/create" },
          { name: "Plan Details", href: "/payment/plans/:id" },
          { name: "Edit Plan", href: "/payment/plans/:id/edit" },
        ],
      },
      // Removed Tariffs navigation item (API doesn't exist in backend)
      {
        name: "Wallets",
        href: "/payment/wallets",
        icon: Wallet,
        children: [
          { name: "Users Wallets", href: "/payment/wallets" },
          { name: "Wallet Details", href: "/payment/wallets/:id" },
          { name: "TopUp Wallet", href: "/payment/wallets/:id/topup" },
          { name: "Wallet History", href: "/payment/wallets/:id/history" },
        ],
      },
      {
        name: "Transactions",
        href: "/payment/transactions",
        icon: Banknote,
        children: [
          { name: "Transaction List", href: "/payment/transactions" },
          { name: "Transaction Details", href: "/payment/transactions/:id" },
        ],
      },
      // Removed Payment Methods navigation item (API doesn't exist in backend)
      {
        name: "Invoices",
        href: "/payment/invoices",
        icon: FileText,
        children: [
          { name: "List Invoices", href: "/payment/invoices" },
          { name: "Create Invoice", href: "/payment/invoices/create" },
          { name: "Invoice Details", href: "/payment/invoices/:id" },
        ],
      },
      {
        name: "Promotions",
        href: "/payment/promotions",
        icon: Gift,
        children: [
          { name: "List Promotions", href: "/payment/promotions" },
          { name: "Create Promotion", href: "/payment/promotions/create" },
          { name: "Promotion Details", href: "/payment/promotions/:id" },
          { name: "Edit Promotion", href: "/payment/promotions/:id/edit" },
        ],
      },
      {
        name: "Tax Templates",
        href: "/payment/tax-templates",
        icon: Calculator,
        children: [
          { name: "List Templates", href: "/payment/tax-templates" },
          { name: "Create Template", href: "/payment/tax-templates/create" },
          { name: "Template Details", href: "/payment/tax-templates/:id" },
          { name: "Edit Template", href: "/payment/tax-templates/:id/edit" },
        ],
      },
      {
        name: "Orders",
        href: "/payment/orders",
        icon: ShoppingCart,
        children: [
          { name: "List Orders", href: "/payment/orders" },
          { name: "Create Order", href: "/payment/orders/create" },
          { name: "Order Details", href: "/payment/orders/:id" },
          { name: "Edit Order", href: "/payment/orders/:id/edit" },
        ],
      },
      {
        name: "Session Billings",
        href: "/payment/session-billings",
        icon: Receipt,
        children: [
          { name: "List Billings", href: "/payment/session-billings" },
          { name: "Create Billing", href: "/payment/session-billings/create" },
          { name: "Billing Details", href: "/payment/session-billings/:id" },
          { name: "Edit Billing", href: "/payment/session-billings/:id/edit" },
        ],
      },
    ],
  },
  
  // Reports
  {
    id: "reports",
    name: "Reports",
    icon: BarChart3,
    items: [
      {
        name: "Usage Reports",
        href: "/reports/usage",
        icon: BarChart3,
      },
      {
        name: "Revenue Reports",
        href: "/reports/revenue",
        icon: BarChart3,
      },
      {
        name: "User Reports",
        href: "/reports/users",
        icon: UserRound,
      },
      {
        name: "Charger Reports",
        href: "/reports/chargers",
        icon: Zap,
      },
      {
        name: "Custom Reports",
        href: "/reports/custom",
        icon: BarChart,
        children: [
          { name: "List Custom Reports", href: "/reports/custom" },
          { name: "Create Report", href: "/reports/custom/create" },
          { name: "Report Details", href: "/reports/custom/:id" },
        ],
      },
    ],
  },
  
  // Notifications
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    items: [
      {
        name: "All Notifications",
        href: "/notifications",
        icon: Bell,
      },
      {
        name: "Templates",
        href: "/notifications/templates",
        icon: FileText,
        children: [
          { name: "List Templates", href: "/notifications/templates" },
          { name: "Create Template", href: "/notifications/templates/create" },
          { name: "Template Details", href: "/notifications/templates/:id" },
          { name: "Edit Template", href: "/notifications/templates/:id/edit" },
        ],
      },
      {
        name: "Email Notifications",
        href: "/notifications/email",
        icon: FileText,
        children: [
          { name: "List Emails", href: "/notifications/email" },
          { name: "Send Email", href: "/notifications/email/send" },
          { name: "Email Details", href: "/notifications/email/:id" },
        ],
      },
      {
        name: "SMS Notifications",
        href: "/notifications/sms",
        icon: MessageCircle,
        children: [
          { name: "List SMS", href: "/notifications/sms" },
          { name: "Send SMS", href: "/notifications/sms/send" },
          { name: "SMS Details", href: "/notifications/sms/:id" },
        ],
      },
      {
        name: "Push Notifications",
        href: "/notifications/push",
        icon: Bell,
        children: [
          { name: "List Push", href: "/notifications/push" },
          { name: "Send Push", href: "/notifications/push/send" },
          { name: "Push Details", href: "/notifications/push/:id" },
        ],
      },
      {
        name: "Alert Settings",
        href: "/notifications/settings",
        icon: AlertCircle,
      },
    ],
  },
  
  // OCPI Integration - Based on OCPI Flowchart
  {
    id: "ocpi",
    name: "OCPI Management",
    icon: Globe,
    items: [
      // ===== ALWAYS VISIBLE ITEMS (ROLE-INDEPENDENT) =====
      {
        name: "Role Selection",
        href: "/ocpi/role-selection",
        icon: UserCheck,
        forceVisible: true, // Always visible regardless of role
      },
      {
        name: "Dashboard",
        href: "/ocpi/dashboard", // This will adapt based on current role
        icon: LayoutDashboard,
        forceVisible: true, // Always visible regardless of role
      },
      {
        name: "Parties",
        href: "/ocpi/parties",
        icon: Building2,
        forceVisible: true, // Always visible regardless of role
      },
      {
        name: "Connections",
        href: "/ocpi/connections",
        icon: Network,
        forceVisible: true, // Always visible regardless of role
      },

      // ===== CPO OPERATIONS SECTION =====
      {
        name: "CPO OPERATIONS",
        href: "#", // Non-navigable section header
        icon: Settings,
        role: "CPO", // Only visible for CPO role
        isSection: true, // Mark as section header
      },
      // CPO OPERATIONS items
      {
        name: "Locations",
        href: "/ocpi/locations",
        icon: MapPin,
        role: "CPO", // Only visible for CPO role
        parent: "CPO OPERATIONS", // Associate with section
      },
      {
        name: "Tariffs",
        href: "/ocpi/tariffs",
        icon: Tag,
        role: "CPO", // Only visible for CPO role
        parent: "CPO OPERATIONS", // Associate with section
      },

      // ===== CPO MONITORING SECTION =====
      {
        name: "CPO MONITORING",
        href: "#", // Non-navigable section header
        icon: Activity,
        role: "CPO", // Only visible for CPO role
        isSection: true, // Mark as section header
      },
      // CPO MONITORING items
      {
        name: "Sessions",
        href: "/ocpi/sessions",
        icon: Clock,
        role: "CPO", // Only visible for CPO role
        parent: "CPO MONITORING", // Associate with section
      },
      {
        name: "CDRs",
        href: "/ocpi/cdrs",
        icon: Receipt,
        role: "CPO", // Only visible for CPO role
        parent: "CPO MONITORING", // Associate with section
      },
      {
        name: "Tokens",
        href: "/ocpi/cpo/tokens",
        icon: KeyRound,
        role: "CPO", // Only visible for CPO role
        parent: "CPO MONITORING", // Associate with section
      },
      {
        name: "Commands",
        href: "/ocpi/commands",
        icon: Terminal,
        role: "CPO", // Only visible for CPO role
        parent: "CPO MONITORING", // Associate with section
      },

      // ===== EMSP OPERATIONS SECTION =====
      {
        name: "EMSP OPERATIONS",
        href: "#", // Non-navigable section header
        icon: Settings,
        role: "EMSP", // Only visible for EMSP role
        isSection: true, // Mark as section header
      },
      // EMSP OPERATIONS items
      {
        name: "Network",
        href: "/ocpi/charge-map", // Using existing charge-map URL
        icon: Globe,
        role: "EMSP", // Only visible for EMSP role
        parent: "EMSP OPERATIONS", // Associate with section
      },
      {
        name: "Tokens",
        href: "/ocpi/tokens",
        icon: KeyRound,
        role: "EMSP", // Only visible for EMSP role
        parent: "EMSP OPERATIONS", // Associate with section
      },

      // ===== EMSP MONITORING SECTION =====
      {
        name: "EMSP MONITORING",
        href: "#", // Non-navigable section header
        icon: Activity,
        role: "EMSP", // Only visible for EMSP role
        isSection: true, // Mark as section header
      },
      // EMSP MONITORING items
      {
        name: "Sessions",
        href: "/ocpi/active-sessions", // Using existing active-sessions URL
        icon: Clock,
        role: "EMSP", // Only visible for EMSP role
        parent: "EMSP MONITORING", // Associate with section
      },
      {
        name: "CDRs",
        href: "/ocpi/cdrs",
        icon: Receipt,
        role: "EMSP", // Only visible for EMSP role
        parent: "EMSP MONITORING", // Associate with section
      },
      {
        name: "Commands",
        href: "/ocpi/commands",
        icon: Terminal,
        role: "EMSP", // Only visible for EMSP role
        parent: "EMSP MONITORING", // Associate with section
      },
      {
        name: "Reservations",
        href: "/ocpi/reservations",
        icon: TicketCheck,
        role: "EMSP", // Only visible for EMSP role
        parent: "EMSP MONITORING", // Associate with section
      },
    ],
  },
  
  // Settings
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    items: [
      {
        name: "General Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        name: "API Settings",
        href: "/settings/api",
        icon: Terminal,
      },
      {
        name: "Payment Settings",
        href: "/settings/payments",
        icon: CreditCard,
      },
      {
        name: "Notification Settings",
        href: "/settings/notifications",
        icon: Bell,
      },
      {
        name: "User Settings",
        href: "/settings/users",
        icon: UserRound,
      },
      {
        name: "Security Settings",
        href: "/settings/security",
        icon: ShieldCheck,
      },
      {
        name: "Integration Settings",
        href: "/settings/integrations",
        icon: ExternalLink,
      },
      {
        name: "Backup & Restore",
        href: "/settings/backup",
        icon: Database,
      },
    ],
  },
];
