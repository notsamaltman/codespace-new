import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ClassroomList } from "@/components/dashboard/ClassroomList";
import { classroomsData, getCodePreview } from "@/data/classrooms";
import CreateJoinSpaceModal from "@/components/dashboard/CreateJoinSpaceModal";

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
  avatarUrl: undefined,
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const classrooms = classroomsData.map((c) => ({
    ...c,
    codePreview: getCodePreview(c.code),
  }));

  const handleCreateClassroom = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={mockUser} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Your Spaces
          </h1>

          {classrooms.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateClassroom}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Space
            </Button>
          )}
        </div>

        <ClassroomList
          classrooms={classrooms}
          onCreateClassroom={handleCreateClassroom}
        />
      </main>

      <CreateJoinSpaceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};


export default Dashboard;
