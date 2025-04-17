import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  LayoutDashboard,
  Settings,
  Image,
  Newspaper,
  FileText,
  Code,
  PanelLeft,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = () => {
  const { user } = useAuth();
  
  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Editor", href: "/editor", icon: FileText },
    { name: "Article Paraphraser", href: "/article-paraphraser", icon: FileText },
    { name: "Image Generator", href: "/image-generator", icon: Image },
    { name: "Image Text Extractor", href: "/image-text-extractor", icon: FileText },
    { name: "File Analyzer", href: "/file-analyzer", icon: FileText },
    { name: "Code Reviewer", href: "/code-reviewer", icon: Code },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Blogger", href: "/blogger", icon: FileText },
    { name: "Google Sheets", href: "/google-sheets", icon: FileText },
    { name: "History", href: "/history", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const location = useLocation();

  const active = (href: string) => {
    return location.pathname === href
      ? "bg-secondary text-secondary-foreground"
      : "hover:bg-secondary";
  };

  const UserButton = ({ name, email, avatarUrl }: { name: string; email: string; avatarUrl?: string }) => (
    <div className="flex items-center space-x-2 p-4 rounded-md">
      <Avatar>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} />
        ) : (
          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <PanelLeft className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Blog Forge</SheetTitle>
          <SheetDescription>
            Navigate through the application using the menu below.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-md ${
                  isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        <UserButton
          name={user?.name || "User"}
          email={user?.email || ""}
          avatarUrl={user?.avatar_url || ""}
        />
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
