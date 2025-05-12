
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GroupForm } from "@/modules/users/components/GroupForm";
import { Group, GroupCreatePayload } from "@/types/group";

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onSubmit: (data: GroupCreatePayload) => Promise<void>;
  isSubmitting: boolean;
}

export function EditGroupDialog({
  open,
  onOpenChange,
  group,
  onSubmit,
  isSubmitting
}: EditGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update group details.
          </DialogDescription>
        </DialogHeader>
        
        {group && (
          <GroupForm 
            group={group}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
