
export interface Domain {
  id: number;
  domain: string;
  tenant: number;
  is_primary: boolean;
  created_at?: string;
}

export interface App {
  id: number;
  label: string;
}

export interface Tenant {
  id: number;
  name: string;
  schema_name: string;
  logo?: string;
  timezone?: string;
  currency?: string;
  country?: string;
  is_active: boolean;
  unfold_site_title?: string;
  unfold_site_header?: string;
  unfold_site_icon?: string;
  domains?: Domain[];
  apps_access?: App[];
  created_at?: string;
  updated_at?: string;
  api_credentials?: {
    api_key: string;
    api_secret: string;
  };
  admin_user?: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface TenantDomain {
  id: number;
  domain: string;
  tenant: number;
  is_primary: boolean;
  created_at?: string;
}

export interface TenantApp {
  id: number;
  label: string;
  name: string; // Added the name property
  description?: string;
  icon?: string;
}

export interface Client {
  id: number;
  name: string;
  schema_name: string;
  logo?: string;
  timezone?: string;
  currency?: string;
  country?: string;
  is_active: boolean;
  unfold_site_title?: string;
  unfold_site_header?: string;
  unfold_site_icon?: string;
  domains?: Domain[];
  apps_access?: App[];
  created_at?: string;
  updated_at?: string;
}

export interface ClientResponse {
  count: number;
  page_size: number;
  results: Client[];
}

export interface CreateClientData {
  name: string;
  schema_name: string;
  logo?: File;
  timezone?: string;
  currency?: string;
  country?: string;
  is_active?: boolean;
  unfold_site_title?: string;
  unfold_site_header?: string;
  unfold_site_icon?: string;
  email_host?: string;
  email_host_user?: string;
  email_host_password?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  razorpay_webhook_secret?: string;
  stripe_secret_key?: string;
  stripe_public_key?: string;
  paypal_client_id?: string;
  paypal_client_secret?: string;
  fcm_api_key?: string;
  apns_certificate?: string;
  paytm_merchant_id?: string;
  paytm_merchant_key?: string;
  paytm_website?: string;
  paytm_industry_type_id?: string;
  paytm_callback_url?: string;
  admin_username?: string;
  admin_email?: string;
  admin_password?: string;
  admin_first_name?: string;
  admin_last_name?: string;
  apps_access?: number[];
}

export interface TenantCreatePayload {
  name: string;
  schema_name: string;
  logo?: File;
  timezone?: string;
  currency?: string;
  country?: string;
  is_active?: boolean;
  unfold_site_title?: string;
  unfold_site_header?: string;
  unfold_site_icon?: string;
  domains?: TenantDomain[];
  apps_access?: number[];
  admin_username?: string;
  admin_email?: string;
  admin_password?: string;
  admin_first_name?: string;
  admin_last_name?: string;
}

export interface TenantUpdatePayload {
  name?: string;
  schema_name?: string;
  logo?: File;
  timezone?: string;
  currency?: string;
  country?: string;
  is_active?: boolean;
  unfold_site_title?: string;
  unfold_site_header?: string;
  unfold_site_icon?: string;
  apps_access?: number[];
}
