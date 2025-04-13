import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TooltipButtonProps {
  icon: React.ReactNode;
  tooltipText: string;
  onClick?: () => void;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({ icon, tooltipText, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button variant="ghost" size="icon" onClick={onClick}>
              {icon}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipButton;
