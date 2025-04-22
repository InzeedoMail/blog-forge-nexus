import React, { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  LayoutDashboard,
  Settings,
  Image,
  Newspaper,
  FileText,
  Code,
  Search,
  LogOut,
  MessageSquare,
  BookOpen,
  Coins,
  History,
  BarChart,
} from "lucide-react";

const APP_NAME = "Blog Forge";

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const mainNavigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Editor", href: "/editor", icon: FileText },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Facebook Posts", href: "/facebook-posts", icon: 'facebook' },
    { name: "Image Generator", href: "/image-generator", icon: Image },
  ];

  const toolNavigation = [
    { name: "Article Paraphraser", href: "/article-paraphraser", icon: BookOpen },
    { name: "Image Text Extractor", href: "/image-text-extractor", icon: FileText },
    { name: "File Analyzer", href: "/file-analyzer", icon: FileText },
    { name: "Code Reviewer", href: "/code-reviewer", icon: Code },
    { name: "Blogger", href: "/blogger", icon: MessageSquare },
    { name: "Google Sheets", href: "/google-sheets", icon: BarChart },
  ];

  const accountNavigation = [
    { name: "History", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isRouteActive = (href: string) => {
    if (href === '/') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const filterItems = (items: typeof mainNavigation) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredMainNav = filterItems(mainNavigation);
  const filteredToolNav = filterItems(toolNavigation);
  const filteredAccountNav = filterItems(accountNavigation);

  // Helper to load correct Lucide icon for Facebook (since not imported by default)
  const getIconComponent = (name) => {
    if (name === 'facebook') {
      const { Facebook } = require("lucide-react");
      return Facebook;
    }
    // Default find in lucide-react
    return mainNavigation.concat(toolNavigation, accountNavigation)
      .find(item => item.name === name)?.icon || Home;
  };

  return (
    <SidebarContainer variant="floating" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1 flex items-center justify-center">
            <span className="font-bold text-primary-foreground">BF</span>
          </div>
          <h2 className="font-semibold text-xl">{APP_NAME}</h2>
        </div>
        <div className="pt-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-9 pl-8"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    asChild
                    isActive={isRouteActive(item.href)}
                  >
                    <NavLink to={item.href}>
                      {item.name === 'Facebook Posts' ? (
                        (() => {
                          const { Facebook } = require("lucide-react");
                          return <Facebook className="h-5 w-5" />;
                        })()
                      ) : (
                        <item.icon className="h-5 w-5" />
                      )}
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <Separator className="my-4" />
        
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredToolNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    asChild
                    isActive={isRouteActive(item.href)}
                  >
                    <NavLink to={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <Separator className="my-4" />
        
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredAccountNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    asChild
                    isActive={isRouteActive(item.href)}
                  >
                    <NavLink to={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user?.name || "User"} />
              ) : (
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "G"}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || "Guest User"}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email || "guest@example.com"}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Sign out"
            className="hover:bg-red-100 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
