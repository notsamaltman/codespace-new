import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
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

  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]); // { userId, name, color, cursor }
  const hasInitializedCodeRef = useRef(false);

  const [localCursor, setLocalCursor] = useState(null);
  const lastSentCursorRef = useRef(null);

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

    // Join room
    newSocket.emit("join-room", { roomId: classroomId, token: localStorage.getItem("token") });

    // Receive initial room state
    newSocket.on("room-state", ({ participants: existingParticipants, code: roomCode }) => {
  // Run ONLY once
  if (!hasInitializedCodeRef.current) {
    if (roomCode && roomCode.trim().length > 0) {
      // Existing room → use saved code
      setCode(roomCode);
    } else {
      // New room → use default and persist it
      setCode(defaultCode);
      newSocket.emit("code-change", {
        roomId: classroomId,
        code: defaultCode,
      });
    }

    hasInitializedCodeRef.current = true;
  }

  const normalized = (existingParticipants || []).map(p => ({
    ...p,
    name: typeof p.name === "string" ? p.name : p.name?.email || "Anonymous",
  }));

  setParticipants(normalized);
});


    // Listen for code updates
    newSocket.on("code-update", ({ code: newCode }) => {
      console.log(`updated ${newCode}`);
      setCode(newCode)});

    // Listen for user joins
    newSocket.on("user-joined", ({ userId, name }) => {
      setParticipants(prev => {
        if (prev.find(p => p.userId === userId)) return prev;
        return [...prev, { userId, name: typeof name === "string" ? name : name?.email || "Anonymous" }];
      });
    });

    // Listen for user leaves
    newSocket.on("user-left", ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    });

    // Listen for cursor updates
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
  // Emit cursor sync every 5s if changed
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
  // Room access
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

  useEffect(() => {
  if (!localCursor) return;
  setParticipants(prev =>
    prev.map(p =>
      p.userId === socket?.id ? { ...p, cursor: localCursor } : p
    )
  );
}, [localCursor, socket?.id]);
useEffect(() => {
  if (!socket || !localCursor) return;
  socket.emit("cursor-sync", { roomId: classroomId, cursor: localCursor });
}, [localCursor, socket, classroomId]);


  const handleJoinRoom = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ roomId: classroomId }),
      });
      if (!res.ok) throw new Error("Join failed");
      setShowJoinModal(false);
    } catch (err) {
      console.error("Join room error", err);
    }
  };

  // Inside Index component:

// Remove emitting on every change
const handleCodeChange = (newCode: string) => {
  setCode(newCode);
  // Removed: socket.emit("code-change", ...)
};

// New Save handler
const handleSave = () => {
  if (!socket) return;
  socket.emit("code-change", { roomId: classroomId, code });
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
      {/* Join Modal */}
      {showJoinModal && roomInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-2">Join Room</h2>
            <p className="text-sm text-muted-foreground mb-4">You are not a member of this room.</p>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {roomInfo.name}</p>
              <p><strong>Members:</strong> {roomInfo.participantCount}</p>
              <p><strong>Language:</strong> {roomInfo.language || "Not set"}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
              <Button onClick={handleJoinRoom}>Join Room</Button>
            </div>
          </div>
        </div>
      )}

      <Header roomId={classroomId || undefined} roomName={roomInfo?.name} />

     
      <div className="border-b px-4 py-2 flex items-center"
     style={{ gap: "8px" }}>
        <Button
          onClick={handleShare}
          className={`h-9 px-4 ${copied ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}
        >
          {copied ? <><Check className="w-4 h-4 mr-2"/> Link copied</> : <><Share2 className="w-4 h-4 mr-2"/> Share</>}
        </Button>

        <Button
      onClick={handleSave}
      className="h-9 px-4 bg-secondary text-secondary-foreground"
      
    >
      Save
    </Button>

        {/* Live participants */}
        <div className="flex items-center space-x-2">
        {participants.map(p => (
          <div key={p.userId} className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
            {p.name} {p.cursor ? `(L${p.cursor.line + 1}:C${p.cursor.ch + 1})` : ""}
          </div>
        ))}

          <span className="ml-2 text-sm text-muted-foreground">({participants.length} online)</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col p-4 pb-20 lg:pb-4 min-w-0">
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            language={language}
            participants={participants.filter(p => p.userId !== socket?.id)}
            onCursorChange={setLocalCursor}
          />
        </main>

        <div className={`${isPanelOpen ? "flex" : "hidden"} lg:flex`}>
          <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} language={language} onLanguageChange={setLanguage} code={code} />
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