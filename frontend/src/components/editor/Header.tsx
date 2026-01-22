import { useState } from "react";
import {
  Users,
  Wifi,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  roomId?: string;
  roomName?: string;
}

// ✅ Frontend-only online users
const onlineUsers = [
  { id: "1", name: "You" },
  { id: "2", name: "Alex Chen" },
];

export function Header({
  roomId = "room-abc123",
  roomName,
}: HeaderProps) {
  const navigate = useNavigate();
  const userInitials = "ME";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      {/* Left: Back + Logo */}
      <div className="flex items-center gap-2 pr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <Logo size={22} />
      </div>

      {/* Center: Room indicator */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
        <Wifi className="w-3.5 h-3.5 text-success" />
        <span className="text-sm text-muted-foreground">
          {roomName ? (
            <span className="text-foreground font-medium">{roomName}</span>
          ) : (
            <>
              Session:{" "}
              <span className="text-foreground font-medium">{roomId}</span>
            </>
          )}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 pr-4">
        {/* ✅ Online dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
              <Users className="w-6 h-6" />
              <span>{onlineUsers.length} online</span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 text-xs text-muted-foreground border-b">
              Online users
            </div>

            {onlineUsers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                className="flex items-center justify-between"
              >
                <span>{user.name}</span>
                <span className="w-2 h-2 rounded-full bg-success" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-11 w-11 cursor-pointer">
              <AvatarFallback className="bg-muted text-xs font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
