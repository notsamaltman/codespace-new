import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthNavbar } from "@/components/landing/AuthNavbar";
import { ClassroomList } from "@/components/dashboard/ClassroomList";
import { getCodePreview } from "@/data/classrooms";
import CreateJoinSpaceModal from "@/components/dashboard/CreateJoinSpaceModal";
import { toast } from "sonner";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classrooms, setClassrooms] = useState([]);

  // Fetch user's rooms on mount
 useEffect(() => {
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

      const res = await fetch(`${API_URL}/rooms/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const text = await res.text(); // read raw response first
      let data;

      try {
        data = JSON.parse(text); // try to parse JSON
      } catch (parseErr) {
        console.error("Failed to parse response as JSON:", text);
        throw new Error("Invalid JSON returned from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch rooms");
      }

      // Map backend rooms to include codePreview
      const mappedClassrooms = data.map((c: any) => ({
        ...c,
        codePreview: c.code ? getCodePreview(c.code) : "",
      }));

      setClassrooms(mappedClassrooms);
    } catch (error: any) {
      console.error("Fetch rooms error:", error);
      toast.error(error.message || "Something went wrong while fetching rooms");
    }
  };

  fetchRooms();
}, []);


  const handleCreateClassroom = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden noise-overlay">
      {/* Navbar */}
      <AuthNavbar />

      {/* Background + Content Wrapper */}
      <div className="relative">
        {/* Background layers */}
        <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />
        <div className="absolute top-32 left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-32 right-20 w-64 h-64 bg-accent/15 rounded-full blur-3xl animate-float-slow pointer-events-none" />

        {/* Main content */}
        <main className="relative container mx-auto px-4 pt-24 pb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Your Spaces</h1>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateClassroom}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Space
            </Button>
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
