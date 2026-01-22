import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClassroom?: () => void;
}

export const EmptyState = ({ onCreateClassroom }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        No classrooms yet
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        You haven't joined any classrooms yet. Create your first classroom to start collaborating with others.
      </p>
      <Button onClick={onCreateClassroom} className="gap-2">
        <Plus className="w-4 h-4" />
        Create your first classroom
      </Button>
    </div>
  );
};
