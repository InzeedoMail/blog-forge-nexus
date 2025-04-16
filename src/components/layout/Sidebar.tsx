import React from "react";
import {
  Home,
  Settings,
  FileText,
  Image,
  History,
  LogOut,
  Database,
  Send,
  FileUp,
  Code,
  ImageDown,
  Newspaper,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  children,
  isActive,
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={isActive ? "bg-sidebar-accent" : ""}
      >
        <Link to={to} className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <span>{children}</span>
          {isActive && (
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary"
              layoutId="sidebar-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/news", icon: Newspaper, label: "News Feed" },
    { path: "/editor", icon: FileText, label: "Editor" },
    {
      path: "/article-paraphraser",
      icon: FileText,
      label: "Article Paraphraser",
    },
    { path: "/image-generator", icon: Image, label: "Image Generator" },
    { path: "/image-text-extractor", icon: ImageDown, label: "Image Text Extractor" },
    { path: "/file-analyzer", icon: FileUp, label: "File Analyzer" },
    { path: "/code-reviewer", icon: Code, label: "Code Reviewer" },
    { path: "/history", icon: History, label: "Post History" },
    { path: "/google-sheets", icon: Database, label: "Google Sheets" },
    { path: "/blogger", icon: Send, label: "Blogger" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 px-4 py-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
          AI
        </div>
        <div className="font-bold text-lg">Blog Forge</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => (
                <SidebarLink
                  key={link.path}
                  to={link.path}
                  icon={link.icon}
                  isActive={isActive(link.path)}
                >
                  {link.label}
                </SidebarLink>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-2 flex items-center gap-3">
          {user && (
            <>
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-sidebar-accent"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
