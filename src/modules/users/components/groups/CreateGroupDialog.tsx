
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GroupForm } from "@/modules/users/components/GroupForm";
import { GroupCreatePayload } from "@/types/group";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GroupCreatePayload) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: CreateGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a new group for user management.
          </DialogDescription>
        </DialogHeader>
        
        <GroupForm 
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
