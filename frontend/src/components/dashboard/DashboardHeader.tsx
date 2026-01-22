import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Logo";

interface DashboardHeaderProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group">
              <Avatar className="h-8 w-8 transition-all group-hover:ring-2 group-hover:ring-primary/50 group-hover:ring-offset-2 group-hover:ring-offset-background">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 glass-strong border border-border"
          >
            {/* User Info */}
            <DropdownMenuLabel className="text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {user.name}
                </span>
                {user.email && (
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              Dashboard
            </DropdownMenuItem>

            {/* <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem> */}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};

export default DashboardHeader;
