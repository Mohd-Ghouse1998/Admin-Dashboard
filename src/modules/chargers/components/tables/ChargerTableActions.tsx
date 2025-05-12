
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ChargerTableActionsProps {
  chargerId: string;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const ChargerTableActions: React.FC<ChargerTableActionsProps> = ({ 
  chargerId, 
  onDelete,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onDelete(chargerId);
      toast({
        title: "Charger deleted",
        description: "The charger was successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting charger:", error);
      toast({
        title: "Error",
        description: "Failed to delete the charger. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={(e) => { 
          e.stopPropagation(); 
          navigate(`/chargers/${chargerId}`);
        }}
      >
        View
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/chargers/${chargerId}/edit`);
        }}
      >
        Edit
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={(e) => e.stopPropagation()}
            disabled={isLoading}
          >
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              charger and may affect any associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
