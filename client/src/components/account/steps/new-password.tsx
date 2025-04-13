import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { Link } from "react-router-dom";

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

const NewPassword = () => {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect if token is missing
    }
  }, [token, navigate]);

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      return apiService.put("/user/update-password", {
        password: newPassword,
        token, // Send token to backend
      });
    },
    onSuccess: () => {
      setSuccessMessage("Your password has been updated.");
      setTimeout(() => navigate("/login"), 2000); // Redirect after success
    },
    onError: (error) => {
      setErrorMessage(error?.message || "Invalid or expired link.");
      setTimeout(() => navigate("/login"), 3000); // Redirect if token is invalid
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    updatePasswordMutation.mutate(password);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-dark-box">
      <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
        <div className="absolute top-10">
          <img src="/logo-black.png" width={85} alt="Logo" />
        </div>

        <div className="flex flex-col justify-center">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold mb-1">Set New Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter and confirm your new password to update it.
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
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="text-white w-full" disabled={updatePasswordMutation.status === "pending"}>
                  {updatePasswordMutation.status === "pending" ? "Updating..." : "Update Password"}
                </Button>
              </form>

              <div className="text-center text-sm mt-4">
                <Link to="/login" className="underline">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/reset.webp"
          alt="Set New Password"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default NewPassword;
