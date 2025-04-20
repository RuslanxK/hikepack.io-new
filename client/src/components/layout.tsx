import React, { Fragment } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import Container from "./ui/container";
import { RecentItemsBar } from "./recent-items-bar";
import { AlignJustify, X } from "lucide-react";

const MobileHeader = () => {
  const { openMobile, toggleSidebar } = useSidebar();

  return (
    <div className="p-4 md:hidden flex items-center justify-between bg-white dark:bg-dark border-b z-50">
      <img src="/logo-black.png" width={85} alt="Logo" />
      <button onClick={toggleSidebar}>
        {openMobile ? <X /> : <AlignJustify />}
      </button>
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const hideSidebarRoutes = ["/login", "/register", "/error", "/reset-password", "/welcome"];
  const shareRoutes = ["/share/", "/verify-account/", "/new-password/"];

  const isShareRoute = shareRoutes.some((route) => location.pathname.startsWith(route));
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname) || isShareRoute;
  const isBagRoute = location.pathname.includes("/bag/");

  return (
    <SidebarProvider>
      <Fragment>
        <div className="flex  w-full flex-col md:flex-row relative">
          {/* Mobile Header */}
          
          {!shouldHideSidebar && <MobileHeader />}


          {/* Sidebar (handled internally for both mobile Sheet and desktop sidebar) */}
          {!shouldHideSidebar && <AppSidebar />}

          {/* Main Content */}
          <div className="overflow-auto bg-light dark:bg-dark w-full">
            {shouldHideSidebar ? children : <Container>{children}</Container>}
          </div>

          <Toaster />
          {isBagRoute && <RecentItemsBar />}
        </div>
      </Fragment>
    </SidebarProvider>
  );
}
