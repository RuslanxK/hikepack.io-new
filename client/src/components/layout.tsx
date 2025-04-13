import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster"
import Container from "./ui/container";
import { RecentItemsBar } from "./recent-items-bar";


export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideSidebarRoutes = ["/login", "/register", "/error", "/reset-password", "/welcome"];
  const shareRoutes = ["/share/", "/verify-account/", "/new-password/"]; 

  const isShareRoute = shareRoutes.some((route) => location.pathname.startsWith(route));
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname) || isShareRoute;
  const isBagRoute = location.pathname.includes("/bag/");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {!shouldHideSidebar && <AppSidebar />}
        <div className="overflow-auto bg-light dark:bg-dark w-full">
          {shouldHideSidebar ? children : <Container>{children}</Container>}
        </div>
        <Toaster />
        {isBagRoute && < RecentItemsBar />}
      </div>
    </SidebarProvider>
  );
}