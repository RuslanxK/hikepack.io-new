import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/lib/apiService";
import LoadingPage from "../loader";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { User } from "@/types/login";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: user, isLoading: isFetchingUser, error: getError, isError: getIsError } = useQuery<User | null>({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await apiService.get(`/user/${id}`);
      return response || null;
    },
    enabled: !!id,
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => apiService.put(`/user/${id}`, { verified: true }),
    onSuccess: () => {
      setTimeout(() => navigate("/login"), 3000);
    },
    onError: (err) => {
      console.error("Verification failed:", err);
    },
  });

  useEffect(() => {
    if (!id) return;
    if (user?.verified) {
      navigate("/login");
    } else if (user && !user.verified) {
      mutate();
    }
  }, [id, user, mutate, navigate]);

  if (isFetchingUser || isPending) return <LoadingPage />;

  const hasError = isError || error || getError || getIsError;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-dark-box px-4 text-center">
      <div className="px-8 py-10 max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          {hasError ? (
            <>
              <XCircle className="h-14 w-14 text-destructive animate-pulse" />
              <AlertTitle className="text-xl font-bold text-destructive">Verification Failed</AlertTitle>
              <AlertDescription className="text-gray-600 dark:text-gray-300 text-md">
                {error?.message || getError?.message || "An error occurred while verifying your account."}
              </AlertDescription>
            </>
          ) : (
            <>
              <CheckCircle className="h-14 w-14 text-primary animate-float" />
              <AlertTitle className="text-2xl font-bold text-primary">Account Verified!</AlertTitle>
              <AlertDescription className="text-gray-600 dark:text-gray-300 text-md">
                Your account has been successfully verified.<br />Redirecting to login...
              </AlertDescription>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
