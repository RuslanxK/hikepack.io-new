export interface SubItemProps {
  name: string;
  url: string;
}

export interface SidebarItemProps {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    collapsible?: boolean;
    subItems?: SubItemProps[];
    onClick?: () => void
  }
  
  
  export interface SidebarItemComponentProps {
    item: SidebarItemProps;
    isCollapsed: boolean;
    toggleCollapse: () => void;
  }