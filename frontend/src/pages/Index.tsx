import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/editor/Header";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { SidePanel } from "@/components/editor/SidePanel";
import { MobileToolbar } from "@/components/editor/MobileToolbar";
import { getClassroomById } from "@/data/classrooms";
import { Button } from "@/components/ui/button";

const defaultCode = `# Collaborative coding session
def main():
    print("Hackvision")

if __name__ == "__main__":
    main()
`;

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const classroomId = searchParams.get("classroom");
  const classroom = classroomId ? getClassroomById(classroomId) : undefined;

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [language, setLanguage] = useState(classroom?.language || "python");
  const [code, setCode] = useState(classroom?.code || defaultCode);

  useEffect(() => {
    if (classroom) {
      setLanguage(classroom.language);
      setCode(classroom.code);
    }
  }, [classroom]);

  // ✅ LOGOUT — SIMPLE, LOCAL, DONE
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth?mode=login");
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header
        roomId={classroomId || undefined}
        roomName={classroom?.name}
      />

      {/* 🔴 LOGOUT BUTTON — GUARANTEED VISIBLE */}
      <div className="border-b px-4 py-2 flex justify-end">
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col p-4 pb-20 lg:pb-4 min-w-0">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
          />
        </main>

        <div className={`${isPanelOpen ? "flex" : "hidden"} lg:flex`}>
          <SidePanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            language={language}
            onLanguageChange={setLanguage}
            code={code}
          />
        </div>
      </div>

      <MobileToolbar
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
      />
    </div>
  );
};

export default Index;
