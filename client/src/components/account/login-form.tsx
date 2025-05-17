import React, { useState} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/apiService';
import { AxiosError } from 'axios';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {ApiError, LoginResponse, InputFieldProps} from "@/types/login"
import { useUser } from "@/context/user-context";
import Cookies from "js-cookie"; 
import { useGoogleLogin } from "@react-oauth/google";
import PersonalInfoDialog from "../dialogs/personal-info";


interface GoogleLoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    username: string;
    imageUrl?: string;
    hasCompletedProfile?: boolean,
    isAdmin: boolean;
  };
}



const InputField = ({ id, label, type, value, placeholder, onChange, children }: InputFieldProps) => (
  <div className="grid gap-2">
    <div className="flex items-center">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
    <Input id={id} type={type} value={value} placeholder={placeholder} onChange={onChange} required />
  </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {

const { setUser, user } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPersonalDialog, setShowPersonalDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>({
  country: "",
  birthdate: "",
  gender: "",
  distance: "",
  weightOption: "",
  activityLevel: "",
});


const handleDialogClose = () => {
  setShowPersonalDialog(false);
  window.location.href = "/";
};


const updateUserMutation = useMutation<void, Error, FormData>({
  mutationFn: async () => {
    return await apiService.put("/user/update", formData);
  },
  onSuccess: (_, updatedData) => {

     console.log(formData)
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    handleDialogClose();
  },
  onError: (err) => {
    console.error("Failed to update user", err);
  },
});




  const loginMutation = useMutation<LoginResponse, AxiosError<ApiError>, { email: string; password: string }>({
    mutationFn: (loginData) => apiService.login<LoginResponse>(loginData),
    onSuccess: (data) => {
      setUser(data.user)
      Cookies.set("token", data.token, {secure: true, sameSite: "strict", expires: 7, });    
      window.location.href = '/';
    },

    
    onError: (error) => {
      setErrorMessage(error?.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    loginMutation.mutate({ email, password });
  };


  const googleLoginMutation = useMutation<GoogleLoginResponse, Error, string>({
    mutationFn: async (accessToken: string): Promise<GoogleLoginResponse> => {
      return await apiService.post<GoogleLoginResponse, { token: string }>("/user/google-login", { token: accessToken });
    },
    onSuccess: (data) => {
      Cookies.set("token", data.token, { secure: true, sameSite: "strict", expires: 7 });
      setUser(data.user);
   if (!data.user.hasCompletedProfile) {
    setShowPersonalDialog(true);
  } else {
    window.location.href = "/";
  }
      
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      setErrorMessage("Google login failed. Please try again.");
    },
  });
  

  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      googleLoginMutation.mutate(response.access_token);
     
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setErrorMessage("Google login failed. Please try again.");
    },
  });


  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit} {...props}>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold m-auto">Login</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email & password below to login to your account
          </p>
        </div>
        {errorMessage && <ErrorAlert message={errorMessage} />}
  
        <div className="grid gap-6">
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            placeholder="m@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          >
            <Link to="/reset-password" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </InputField>
          <Button type="submit" className="w-full text-white" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
  
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        disabled={loginMutation.isPending}
        onClick={() => googleLogin()}
      >
        <img src="/google.webp" alt="Google Icon" className="h-5 w-5" />
        Login with Google
      </Button>
  
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="underline underline-offset-4">Sign up</Link>
      </div>

     {showPersonalDialog && (
  <PersonalInfoDialog
  onClose={handleDialogClose}
  formData={formData}
  onUpdate={() => updateUserMutation.mutate(formData)}
  updateFormData={(data) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
  }}
  isUpdating={updateUserMutation.isPending}
/>
)}


    </div>
  );
}