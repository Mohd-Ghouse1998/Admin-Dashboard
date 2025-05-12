
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Edit, ArrowDown, ArrowUp } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { formatDate } from "@/utils/formatters";
import { DomainTable } from "./DomainTable";

interface TenantDetailCardProps {
  tenant: Tenant;
  onEdit: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onAddDomain?: (domain: string) => void;
  onDeleteDomain?: (id: string | number) => void;
  isLoadingDomains?: boolean;
}

export const TenantDetailCard: React.FC<TenantDetailCardProps> = ({
  tenant,
  onEdit,
  onActivate,
  onDeactivate,
  onAddDomain,
  onDeleteDomain,
  isLoadingDomains = false,
}) => {
  const [showApiCredentials, setShowApiCredentials] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tenant.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">Schema: {tenant.schema_name}</p>
        </div>
        <div className="flex gap-2">
          {tenant.is_active ? (
            <Button
              variant="outline"
              onClick={onDeactivate}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <ArrowDown className="h-4 w-4 mr-2" /> Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onActivate}
              className="border-green-500 text-green-500 hover:bg-green-50"
            >
              <ArrowUp className="h-4 w-4 mr-2" /> Activate
            </Button>
          )}
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <Badge
          className={
            tenant.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }
        >
          {tenant.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Tenant Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-base font-semibold">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Schema Name</p>
              <p className="text-base font-semibold">{tenant.schema_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</p>
              <p className="text-base font-semibold">{tenant.country}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</p>
              <p className="text-base font-semibold">{tenant.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Timezone</p>
              <p className="text-base font-semibold">{tenant.timezone || "UTC"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
              <p className="text-base font-semibold">{formatDate(tenant.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</p>
              <p className="text-base font-semibold">{formatDate(tenant.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Credentials Card */}
      {tenant.api_credentials && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>API Credentials</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiCredentials(!showApiCredentials)}
            >
              {showApiCredentials ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" /> Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" /> Show
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">API Key</p>
                <p className="text-base font-semibold font-mono">
                  {showApiCredentials ? tenant.api_credentials.api_key : "•••••••••••••••••"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">API Secret</p>
                <p className="text-base font-semibold font-mono">
                  {showApiCredentials ? tenant.api_credentials.api_secret : "•••••••••••••••••"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin User Card */}
      {tenant.admin_user && (
        <Card>
          <CardHeader>
            <CardTitle>Admin User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                <p className="text-base font-semibold">{tenant.admin_user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-base font-semibold">{tenant.admin_user.email}</p>
              </div>
              {tenant.admin_user.first_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</p>
                  <p className="text-base font-semibold">{tenant.admin_user.first_name}</p>
                </div>
              )}
              {tenant.admin_user.last_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</p>
                  <p className="text-base font-semibold">{tenant.admin_user.last_name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Domain Management */}
      <DomainTable 
        tenant={tenant}
        onAddDomain={onAddDomain}
        onDeleteDomain={onDeleteDomain}
        isLoading={isLoadingDomains}
      />
    </div>
  );
};
