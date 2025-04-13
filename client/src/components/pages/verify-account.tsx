import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/lib/apiService";
import LoadingPage from "../loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <Alert variant={hasError ? "destructive" : "default"} className="w-fit">
        <div className="flex flex-col items-center gap-4 p-3">
          {hasError ? (
            <>
              <XCircle className="h-14 w-14 text-red-500" />
              <AlertTitle className="text-xl font-bold">Verification Failed</AlertTitle>
              <AlertDescription className="text-gray-600 dark:text-gray-300 text-md">
                {error?.message || getError?.message || "An error occurred while verifying your account."}
              </AlertDescription>
            </>
          ) : (
            <>
              <CheckCircle className="h-14 w-14 text-green-500" />
              <AlertTitle className="text-xl font-bold">Account Verified!</AlertTitle>
              <AlertDescription className="text-gray-600 dark:text-gray-300 text-md">
                Your account has been successfully verified. Redirecting...
              </AlertDescription>
            </>
          )}
        </div>
      </Alert>
    </div>
  );
};

export default VerifyAccount;
