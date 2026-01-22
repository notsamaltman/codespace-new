import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client"; // <-- import socket.io-client
import { Header } from "@/components/editor/Header";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { SidePanel } from "@/components/editor/SidePanel";
import { MobileToolbar } from "@/components/editor/MobileToolbar";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

const defaultCode = `# Collaborative coding session
def main():
    print("Hackvision")

if __name__ == "__main__":
    main()
`;

const Index = () => {
  const { id: classroomId } = useParams();

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(defaultCode);
  const [copied, setCopied] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  // -------------------------
  // 1️⃣ Create socket instance
  // -------------------------
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!classroomId || checkingRoom || showJoinModal) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      autoConnect: false,
      auth: { token: localStorage.getItem("token") },
    });

    setSocket(newSocket);
    newSocket.connect();

    // join the room
    newSocket.emit("join-room", { roomId: classroomId });

    // listen for code updates from other users
    newSocket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    // listen for users joining (optional)
    newSocket.on("user-joined", ({ userId }) => {
      console.log("User joined:", userId);
    });

    // cleanup on unmount or room change
    return () => {
      newSocket.emit("leave-room", { roomId: classroomId });
      newSocket.disconnect();
    };
  }, [classroomId, checkingRoom, showJoinModal]);

  // -------------------------
  // 2️⃣ Broadcast local code changes
  // -------------------------
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socket) {
      socket.emit("code-change", { roomId: classroomId, code: newCode });
    }
  };

  // -------------------------
  // 3️⃣ Room access logic (unchanged)
  // -------------------------
  useEffect(() => {
    if (!classroomId) return;

    const checkRoom = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/rooms/check/${classroomId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = await res.json();

        if (data.inRoom) {
          setRoomInfo(data.room || null);
          setCheckingRoom(false);
        } else {
          setRoomInfo(data.room);
          setShowJoinModal(true);
          setCheckingRoom(false);
        }
      } catch (err) {
        console.error("Room check failed", err);
        setCheckingRoom(false);
      }
    };

    checkRoom();
  }, [classroomId]);

  const handleJoinRoom = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ roomId: classroomId }),
        }
      );
      if (!res.ok) throw new Error("Join failed");
      setShowJoinModal(false);
    } catch (err) {
      console.error("Join room error", err);
    }
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/editor?classroom=${classroomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (checkingRoom) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking room access...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {showJoinModal && roomInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-2">Join Room</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You are not a member of this room.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {roomInfo.name}</p>
              <p><strong>Members:</strong> {roomInfo.participantCount}</p>
              <p><strong>Language:</strong> {roomInfo.language || "Not set"}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button onClick={handleJoinRoom}>Join Room</Button>
            </div>
          </div>
        </div>
      )}

      <Header roomId={classroomId || undefined} roomName={roomInfo?.name} />

      <div className="border-b px-4 py-2 flex justify-end">
        <Button
          onClick={handleShare}
          className={`h-9 px-4 ${
            copied
              ? "bg-success text-success-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Link copied
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col p-4 pb-20 lg:pb-4 min-w-0">
          <CodeEditor code={code} onChange={handleCodeChange} language={language} />
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
