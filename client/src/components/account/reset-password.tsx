import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/apiService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface CheckEmailResponse {
  exists: boolean;
}

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const SuccessAlert = ({ message }: { message: string }) => (
  <Alert variant="primary">
    <CheckCircle className="h-4 w-4" />
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);


const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const checkEmailMutation = useMutation({
    mutationFn: (email: string) => apiService.post<CheckEmailResponse, { email: string }>("/user/reset-email-check", { email }),
    onSuccess: (data) => {
      if (data.exists) {
        setSuccessMessage("To continue, check your email.");
        setErrorMessage(""); 
      } else {
        setErrorMessage("This email does not exist.");
        setSuccessMessage(""); 
      }
    },
    onError: (error) => {
      setErrorMessage(error?.message || "An error occurred. Please try again.");
      setSuccessMessage(""); 
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (email.trim() === "") {
      setErrorMessage("Email is required.");
      return;
    }
    checkEmailMutation.mutate(email);
  };

  return (
   <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-dark-box text-black dark:text-white">
 
  <div className="flex flex-col h-full p-6 md:p-10">
    <div className="mb-6">
      
      <img src="/logo-black.png" width={85} alt="Logo" className="block dark:hidden" />
      
      <img src="/logo-white.png" width={85} alt="Logo" className="hidden dark:block" />
    </div>

    <div className="flex flex-col justify-center h-full">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Enter your email address to reset your password.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          {errorMessage && (
            <div className="mb-5">
              <ErrorAlert message={errorMessage} />
            </div>
          )}

          {successMessage && (
            <div className="mb-5">
              <SuccessAlert message={successMessage} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="bg-white dark:bg-dark text-black dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="text-white w-full dark:bg-primary dark:hover:bg-primary/80"
              disabled={checkEmailMutation.status === "pending"}
            >
              {checkEmailMutation.status === "pending" ? "Checking..." : "Submit"}
            </Button>
          </form>

          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground dark:text-gray-400">
              Remembered your password?{" "}
              <Link to="/login" className="underline hover:text-primary dark:hover:text-primary">
                Login here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="relative hidden bg-muted lg:block">
    <img
      src="/reset-pass.webp"
      alt="Reset Password"
      className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
    />
  </div>
</div>

  );
};

export default ResetPassword;
