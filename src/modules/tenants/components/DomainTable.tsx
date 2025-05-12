
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tenant, TenantDomain } from "@/types/tenant";
import { formatDate } from "@/utils/formatters";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface DomainTableProps {
  tenant: Tenant;
  domains?: TenantDomain[];
  isLoading?: boolean;
  onAddDomain?: (domain: string) => void;
  onDeleteDomain?: (id: string | number) => void;
}

export const DomainTable: React.FC<DomainTableProps> = ({
  tenant,
  domains = [],
  isLoading = false,
  onAddDomain,
  onDeleteDomain
}) => {
  const [newDomain, setNewDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDomain = () => {
    if (!onAddDomain || !newDomain.trim()) return;
    
    setIsSubmitting(true);
    onAddDomain(newDomain.trim());
    setNewDomain("");
    // Timeout for better UX - real state change is managed by the parent
    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Domain Form */}
        {onAddDomain && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Enter domain (e.g., example.com)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button 
              onClick={handleAddDomain} 
              disabled={!newDomain.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Domain
            </Button>
          </div>
        )}

        {/* Domains List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : domains.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created At</TableHead>
                {onDeleteDomain && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.domain}</TableCell>
                  <TableCell>
                    {domain.is_primary ? (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Primary
                      </Badge>
                    ) : (
                      <Badge variant="outline">Secondary</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(domain.created_at)}</TableCell>
                  {onDeleteDomain && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteDomain(domain.id)}
                        disabled={domain.is_primary} // Prevent deleting primary domain
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No domains found for this tenant.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
