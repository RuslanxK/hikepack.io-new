import { ReactNode } from "react";

export interface ApiError {
  message?: string;
}

export interface User {
  _id?: string
  email?: string;
  username?: string;
  birthdate?: string; // ISO date string
  password?: string;
  coins?: number;
  weightOption?: 'lb' | 'kg'; // Assuming weight units
  imageUrl?: string;
  verified?: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: string | null;
  distance?: 'miles' | 'km'; // Assuming distance units
  emailVerificationToken?: string | null;
  emailVerificationExpires?: string | null;
  googleId?: string;
  gender?: string;
  activityLevel?: string;
  country?: string;
  isAdmin?: boolean;
  lastLoggedIn?: Date | null;
  hasCompletedProfile?: boolean,
  latestBagWeight?: number;
  createdAt?: Date; // Managed by Mongoose timestamps
  updatedAt?: Date; // Managed by Mongoose timestamps
  
}

export interface LoginResponse {
  token: string;
  user: User
}

export interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}