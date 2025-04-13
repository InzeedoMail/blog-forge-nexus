
import React from "react";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import AppSidebar from "./Sidebar";
import { 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container p-4 sm:p-6 md:p-8">
            <div className="flex items-center mb-6">
              <SidebarTrigger className="md:hidden mr-4" />
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
