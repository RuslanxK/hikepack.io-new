import React, { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import Container from "./ui/container";
import { RecentItemsBar } from "./recent-items-bar";
import { AlignJustify, X } from "lucide-react";

const MobileHeader = () => {

  const navigate = useNavigate()

  const { openMobile, toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 p-4 md:hidden flex items-center justify-between bg-white dark:bg-dark border-b z-50">
      <img src="/logo-black.png" width={85} alt="Logo" onClick={() => navigate("/") } />
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
        <div className="flex w-full flex-col md:flex-row">
          {/* Mobile Header */}
          
          {!shouldHideSidebar && <MobileHeader />}


          {/* Sidebar (handled internally for both mobile Sheet and desktop sidebar) */}
          {!shouldHideSidebar && <AppSidebar />}

          {/* Main Content */}
          <div className="bg-light dark:bg-dark w-full min-h-screen flex flex-col">
  {shouldHideSidebar ? children : <Container>{children}</Container>}
</div>

          <Toaster />
          {isBagRoute && <RecentItemsBar />}
        </div>
      </Fragment>
    </SidebarProvider>
  );
}
