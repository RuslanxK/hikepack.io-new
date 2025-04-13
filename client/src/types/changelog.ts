import { User } from "@/types/login";
import { ChangeLog as ChangeLogType } from "@/types/changelog";


export interface ChangeLog {
    _id?: string;
    title: string;
    description: string;
    createdAt: string; 
  }

  export interface SingleChangeLogProps {
    log: ChangeLogType;
    user: User;
  }