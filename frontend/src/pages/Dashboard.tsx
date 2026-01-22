import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthNavbar } from "@/components/landing/AuthNavbar";
import { ClassroomList } from "@/components/dashboard/ClassroomList";
import { classroomsData, getCodePreview } from "@/data/classrooms";
import CreateJoinSpaceModal from "@/components/dashboard/CreateJoinSpaceModal";

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
    <div className="min-h-screen bg-background overflow-x-hidden noise-overlay">
      {/* Navbar */}
      <AuthNavbar />

      {/* Background + Content Wrapper */}
      <div className="relative">
        {/* Background layers (same feel as Features page) */}
        <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />
        <div className="absolute top-32 left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-32 right-20 w-64 h-64 bg-accent/15 rounded-full blur-3xl animate-float-slow pointer-events-none" />

        {/* Main content */}
        <main className="relative container mx-auto px-4 pt-24 pb-8 animate-fade-in-up">
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
      </div>

      {/* Modal */}
      <CreateJoinSpaceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
