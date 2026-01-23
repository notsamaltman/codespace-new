import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Header } from "@/components/editor/Header";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { SidePanel } from "@/components/editor/SidePanel";
import { MobileToolbar } from "@/components/editor/MobileToolbar";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";

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
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [localCursor, setLocalCursor] = useState(null);
  const lastSentCursorRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const [codeHistory, setCodeHistory] = useState<
    { code: string; timestamp: number; userId: string }[]
  >([]);

  // -------------------------
  // Socket.IO connection
  // -------------------------
  useEffect(() => {
    if (!classroomId || checkingRoom || showJoinModal) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      autoConnect: false,
      auth: { token: localStorage.getItem("token") },
    });

    setSocket(newSocket);
    newSocket.connect();

    newSocket.emit("join-room", { roomId: classroomId, token: localStorage.getItem("token") });

    newSocket.on("room-state", ({ participants: existingParticipants, code: roomCode, codeHistory }) => {
      setCode(roomCode);
      setCodeHistory(codeHistory || []);
      const normalized = (existingParticipants || []).map(p => ({
        ...p,
        name: typeof p.name === "string" ? p.name : p.name?.email || "Anonymous",
      }));
      setParticipants(normalized);
    });

    newSocket.on("code-update", ({ code: newCode }) => setCode(newCode));
    newSocket.on("code-history-update", (history) => setCodeHistory(history));

    newSocket.on("user-joined", ({ userId, name }) => {
      setParticipants(prev => {
        if (prev.find(p => p.userId === userId)) return prev;
        return [...prev, { userId, name: typeof name === "string" ? name : name?.email || "Anonymous" }];
      });
    });

    newSocket.on("user-left", ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    });

    newSocket.on("cursor-batch-update", ({ userId, cursor, color, name }) => {
      setParticipants(prev =>
        prev.map(p => (p.userId === userId ? { ...p, cursor, color, name } : p))
      );
    });

    return () => {
      newSocket.emit("leave-room", { roomId: classroomId });
      newSocket.disconnect();
    };
  }, [classroomId, checkingRoom, showJoinModal]);

  // -------------------------
  // Cursor sync
  // -------------------------
  useEffect(() => {
    if (!socket || !localCursor) return;

    const interval = setInterval(() => {
      const last = lastSentCursorRef.current;
      if (!last || last.line !== localCursor.line || last.ch !== localCursor.ch) {
        socket.emit("cursor-sync", { roomId: classroomId, cursor: localCursor });
        lastSentCursorRef.current = localCursor;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [socket, localCursor, classroomId]);

  // -------------------------
  // Room access check
  // -------------------------
  useEffect(() => {
    if (!classroomId) return;

    const checkRoom = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rooms/check/${classroomId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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

  const handleSave = () => {
    if (!socket) return;
    setIsSaving(true);

    socket.emit(
      "code-change",
      { roomId: classroomId, code, token: localStorage.getItem("token") },
      (response) => {
        if (response?.success) {
          toast.success("Change successfully committed!");
        } else {
          toast.error("Failed to save code.");
        }
        setIsSaving(false);
      }
    );
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/editor/${classroomId}`;
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
      <Header roomId={classroomId || undefined} roomName={roomInfo?.name} />
      <div className="border-b px-4 py-2 flex justify-between items-center">
        <Button onClick={handleShare} className={`h-9 px-4 ${copied ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}>
          {copied ? <> <Check className="w-4 h-4 mr-2"/> Link copied </> : <> <Share2 className="w-4 h-4 mr-2"/> Share </>}
        </Button>

        <Button onClick={handleSave} disabled={isSaving} className={`h-9 px-4 ${isSaving ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"}`}>
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <div className="flex items-center space-x-2">
          {participants.map(p => (
            <div key={p.userId} className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
              {p.name} {p.cursor ? `(L${p.cursor.line + 1}:C${p.cursor.ch + 1})` : ""}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">({participants.length} online)</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col p-4 pb-20 lg:pb-4 min-w-0">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            participants={participants.filter(p => p.userId !== socket?.id)}
            onCursorChange={setLocalCursor}
          />
        </main>

        <div className={`${isPanelOpen ? "flex" : "hidden"} lg:flex`}>
          <SidePanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            language={language}
            onLanguageChange={setLanguage}
            code={code}
            roomId={classroomId}
            onCodeUpdate={setCode}
            codeHistory={codeHistory}
          />
        </div>
      </div>

      <MobileToolbar isPanelOpen={isPanelOpen} onTogglePanel={() => setIsPanelOpen(!isPanelOpen)} />
    </div>
  );
};

export default Index;
// import { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { io } from "socket.io-client";
// import { Header } from "@/components/editor/Header";
// import { CodeEditor } from "@/components/editor/CodeEditor";
// import { SidePanel } from "@/components/editor/SidePanel";
// import { MobileToolbar } from "@/components/editor/MobileToolbar";
// import { Button } from "@/components/ui/button";
// import { Share2, Check } from "lucide-react";

// const defaultCode = `# Collaborative coding session
// def main():
//     print("Hackvision")

// if __name__ == "__main__":
//     main()
// `;

// const Index = () => {
//   const { id: classroomId } = useParams();

//   const [isPanelOpen, setIsPanelOpen] = useState(true);
//   const [language, setLanguage] = useState("python");
//   const [code, setCode] = useState(defaultCode);
//   const [copied, setCopied] = useState(false);
//   const [checkingRoom, setCheckingRoom] = useState(true);
//   const [showJoinModal, setShowJoinModal] = useState(false);
//   const [roomInfo, setRoomInfo] = useState(null);

//   const [socket, setSocket] = useState(null);
//   const [participants, setParticipants] = useState([]);
//   const hasInitializedCodeRef = useRef(false);

//   const [localCursor, setLocalCursor] = useState(null);
//   const lastSentCursorRef = useRef(null);

//   const handleCodeChange = (newCode: string) => {
//     setCode(newCode);
//   };

//   const handleSave = () => {
//     if (!socket) return;
//     socket.emit("code-change", { roomId: classroomId, code });
//   };

//   const handleShare = async () => {
//     const link = `${window.location.origin}/editor/${classroomId}`;
//     await navigator.clipboard.writeText(link);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (checkingRoom) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-background">
//         <p className="text-muted-foreground">Checking room access...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col bg-background overflow-hidden">
//       <Header roomId={classroomId || undefined} roomName={roomInfo?.name} />

//       {/* Share + Save + Participants */}
//       <div
//         className="border-b px-4 py-2 flex justify-between items-center"
//         style={{ gap: "8px" }}   // 👈 INLINE CSS ADDED
//       >
//         <Button
//           onClick={handleShare}
//           className={`h-9 px-4 ${
//             copied
//               ? "bg-success text-success-foreground"
//               : "bg-primary text-primary-foreground"
//           }`}
//         >
//           {copied ? (
//             <>
//               <Check className="w-4 h-4 mr-2" /> Link copied
//             </>
//           ) : (
//             <>
//               <Share2 className="w-4 h-4 mr-2" /> Share
//             </>
//           )}
//         </Button>

//         <Button
//           onClick={handleSave}
//           className="h-9 px-4 bg-secondary text-secondary-foreground"
//           style={{ marginLeft: "-8px" }}   // 👈 INLINE CSS TO MOVE LEFT
//         >
//           Save
//         </Button>

//         {/* Participants */}
//         <div className="flex items-center space-x-2">
//           {participants.map((p) => (
//             <div
//               key={p.userId}
//               className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm"
//             >
//               {p.name}
//               {p.cursor
//                 ? ` (L${p.cursor.line + 1}:C${p.cursor.ch + 1})`
//                 : ""}
//             </div>
//           ))}
//           <span className="ml-2 text-sm text-muted-foreground">
//             ({participants.length} online)
//           </span>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex overflow-hidden">
//         <main className="flex-1 flex flex-col p-4 pb-20 lg:pb-4 min-w-0">
//           <CodeEditor
//             code={code}
//             onChange={handleCodeChange}
//             language={language}
//             participants={participants.filter((p) => p.userId !== socket?.id)}
//             onCursorChange={setLocalCursor}
//           />
//         </main>

//         <div className={`${isPanelOpen ? "flex" : "hidden"} lg:flex`}>
//           <SidePanel
//             isOpen={isPanelOpen}
//             onClose={() => setIsPanelOpen(false)}
//             language={language}
//             onLanguageChange={setLanguage}
//             code={code}
//           />
//         </div>
//       </div>

//       <MobileToolbar
//         isPanelOpen={isPanelOpen}
//         onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
//       />
//     </div>
//   );
// };

// export default Index;