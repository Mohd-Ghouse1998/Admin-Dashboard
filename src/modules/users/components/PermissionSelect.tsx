
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Permission } from "@/types/permission";
import { usePermission } from "@/hooks/usePermission";
import { Loader2, Search, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface PermissionSelectProps {
  onSelect: (permissions: Permission[]) => void;
  selectedPermissionIds: number[];
  trigger: React.ReactNode;
}

export const PermissionSelect: React.FC<PermissionSelectProps> = ({
  onSelect,
  selectedPermissionIds,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    permissionsData,
    isLoadingPermissions,
    setSearchQuery,
    resetPage,
  } = usePermission();

  // Initialize selected permissions
  useEffect(() => {
    setSelectedIds(selectedPermissionIds);
  }, [selectedPermissionIds, open]);

  // Update search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      resetPage();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, setSearchQuery, resetPage]);

  const permissions = permissionsData?.results || [];

  const handleSelect = (permissionId: number) => {
    setSelectedIds((current) => {
      if (current.includes(permissionId)) {
        return current.filter((id) => id !== permissionId);
      } else {
        return [...current, permissionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (permissions.length > 0 && selectedIds.length === permissions.length) {
      // Deselect all
      setSelectedIds([]);
    } else {
      // Select all
      setSelectedIds(permissions.map((p) => p.id));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const selectedPermissions = permissions.filter((p) => selectedIds.includes(p.id));
    await onSelect(selectedPermissions);
    setIsSubmitting(false);
    setOpen(false);
  };

  const isAllSelected = permissions.length > 0 && selectedIds.length === permissions.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Select the permissions you want to assign. Search or filter by name.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {isLoadingPermissions ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 py-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer select-none">
                Select all ({permissions.length})
              </label>
              <Badge variant="outline" className="ml-auto">
                {selectedIds.length} selected
              </Badge>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start gap-2 px-2 py-1 rounded-md hover:bg-accent"
                  >
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedIds.includes(permission.id)}
                      onCheckedChange={() => handleSelect(permission.id)}
                    />
                    <div className="grid gap-0.5">
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        {permission.name}
                      </label>
                      <div className="flex flex-wrap gap-1 text-xs">
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                          <Shield className="h-3 w-3" />
                          {permission.codename}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {permission.content_type_app}
                        </Badge>
                        <Badge variant="outline" className="bg-muted/50 text-xs">
                          {permission.content_type_model}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {permissions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No permissions found
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
