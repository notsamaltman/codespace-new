import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/editor/Header";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { SidePanel } from "@/components/editor/SidePanel";
import { MobileToolbar } from "@/components/editor/MobileToolbar";
import { getClassroomById } from "@/data/classrooms";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

const defaultCode = `# Collaborative coding session
def main():
    print("Hackvision")

if __name__ == "__main__":
    main()
`;

const Index = () => {
  const [searchParams] = useSearchParams();

  const classroomId = searchParams.get("classroom");
  const classroom = classroomId ? getClassroomById(classroomId) : undefined;

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [language, setLanguage] = useState(classroom?.language || "python");
  const [code, setCode] = useState(classroom?.code || defaultCode);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (classroom) {
      setLanguage(classroom.language);
      setCode(classroom.code);
    }
  }, [classroom]);

  // ✅ SHARE HANDLER
  const handleShare = async () => {
    const link = `${window.location.origin}/editor?classroom=${classroomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header
        roomId={classroomId || undefined}
        roomName={classroom?.name}
      />

      {/* 🔵 SHARE BAR (replaces logout completely) */}
      <div className="border-b px-4 py-2 flex justify-end">
        <Button
          onClick={handleShare}
          className={`h-9 px-4 transition-colors ${
            copied
              ? "bg-success hover:bg-success text-success-foreground"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Link copied
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </>
          )}
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
