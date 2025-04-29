import { Fragment, useState } from "react";
import {Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom"; 
import {Home, Backpack,Book, Users,Settings, FileText,Shield,ChevronDown, ChevronUp,LogOut,ShieldAlert, Sun, Moon } from "lucide-react";
import {SidebarItemProps, SidebarItemComponentProps } from '../types/sidebar'
import { useUser } from "@/context/user-context";
import { apiService } from "@/lib/apiService";
import { BagItem } from "@/types/bag";
import { useQuery } from "@tanstack/react-query";
import { Coffee } from "lucide-react";
import SupportUsDialog from "./dialogs/support-us";
import Cookies from "js-cookie";
import { useSidebar } from "@/components/ui/sidebar";



const fetchRecentBags = async (limit: number = 5): Promise<BagItem[]> => {
  const response = await apiService.get<BagItem[]>(`/bags/latest?limit=${limit}`);
  return response;
};

const SidebarItem = ({ item, isCollapsed, toggleCollapse }: SidebarItemComponentProps) => {

  const { toggleSidebar } = useSidebar(); 
  const navigate = useNavigate()

  const handleClick = (url: string) => {
    if (window.innerWidth < 768) {
      toggleSidebar(); 
    }
    navigate(url); 
  };


  if (item.collapsible) {
    return (
      <SidebarMenuItem>
        <button
          onClick={toggleCollapse}
          className="flex items-center w-full gap-2 px-2 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-box rounded-md"
        >
          <item.icon className="w-4 h-4" />
          <span>{item.title}</span>
          <div className="ml-auto">
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {isCollapsed && (
          <SidebarMenuSub>
            {item.subItems?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.url}>
                <button
                  onClick={() => handleClick(subItem.url)}
                  className="rounded-lg block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-box"
                >
                  {subItem.name}
                </button>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <button
          onClick={() => handleClick(item.url)}
          className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-dark-box rounded-md"
        >
          <item.icon className="w-5 h-5" />
          <span>{item.title}</span>
        </button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const ThemeToggle = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => (
  <div className="p-4 border-t border-gray-200 dark:border-dark-box flex items-center gap-2">
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="flex items-center gap-2 dark:bg-dark dark:hover:bg-dark-box"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </Button>
    <span className="text-sm">Mode</span>
  </div>
);
const UserProfile = () => {
  const { user } = useUser();
  const { setTheme } = useTheme();

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
    setTheme("light"); 
  };

  const { toggleSidebar } = useSidebar(); 
  const navigate = useNavigate()

  const handleClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar(); 
    }
    navigate('/settings'); 
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-dark-box cursor-pointer">
    <div className="flex items-center gap-3 mb-4" onClick={handleClick}>
      <img
        src={user?.imageUrl || "/default-profile-placeholder.png"}
        alt="User Avatar"
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <p className="text-sm font-medium truncate capitalize">
          {user?.username || "Guest"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user?.isAdmin ? "Admin" : "Hiker"}
        </p>
        <div className="flex items-center justify-end">
        <img src={"/currency-icon.svg"} alt="credits" className="w-5 h-5 rounded-full"/>
        <span className="ml-2 text-sm">
        <b className={(user?.coins ?? 0) > 0 ? "text-primary" : "text-red-600"}>{user?.coins ?? 0} </b> coins</span>
        </div>
      </div>
    </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-box rounded-md">
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false)
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const { data: fetchedRecentBags = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["recentBags", { limit: 5 }],
    queryFn: () => fetchRecentBags(5),
  });


  const items: SidebarItemProps[] = [
    { title: "Home", url: "/", icon: Home },
    {
      title: "Recent Bags",
      url: "#",
      icon: Backpack,
      collapsible: true,
      subItems: isCategoriesLoading
  ? [{ name: "Loading...", url: "#" }]
  : fetchedRecentBags.map((bag) => {
      const name = bag.name ?? "Unnamed Bag";
      const truncatedName = name.length > 20 ? name.slice(0, 20) + "..." : name;

      return {
        name: truncatedName,
        url: `/bag/${bag._id}`,
      };
    }),
    },
    { title: "Articles", url: "/articles", icon: Book },
    { title: "Community", url: "/community", icon: Users },
    { title: "Settings", url: "/settings", icon: Settings },
    { title: "Changelog", url: "/changelog", icon: FileText },
    { title: "Report a Bug", url: "/bug-report", icon: ShieldAlert,  },
    ...(user?.isAdmin ? [{ title: "Admin Panel", url: "/admin", icon: Shield }] : []),
   
  ];
  

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  
  const closeDialog = () => setIsSupportDialogOpen(false);

  return (
    <Fragment>
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarContent className="flex flex-col h-screen justify-between bg-white dark:bg-dark-nav text-gray-800 dark:text-gray-100">
        <div className="flex justify-center border-b border-gray-200 dark:border-dark-box p-1">
          <img
            src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
            alt="Logo"
            onClick={() => navigate('/')}
            className="h-20 w-24 object-contain"
          />
        </div>

        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarItem
                    key={item.title}
                    item={item}
                    isCollapsed={isCollapsed && item.collapsible === true}
                    toggleCollapse={toggleCollapse}
                  />
                ))}
              </SidebarMenu>
              
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>

        <div className="px-4">
            <Button
                className="relative font-extrabold w-full py-4 mt-3 border-4 shadow-2xl overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:blur-lg before:opacity-50 before:transition-all before:duration-500 text-white bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 border-red-300 hover:-translate-y-1 before:bg-gradient-to-r before:from-red-300 before:via-orange-300 before:to-yellow-300"
                variant="default"
                onClick={() => setIsSupportDialogOpen(true)}
              >
                <span className="relative z-10 flex items-center gap-2">
                Support Us <Coffee className="text-white" size={20} />
                </span>
            
              </Button>
              </div>

        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <UserProfile />
      </SidebarContent>
    </Sidebar>
    <SupportUsDialog isOpen={isSupportDialogOpen} onClose={closeDialog} />

  </Fragment>
  );
}
