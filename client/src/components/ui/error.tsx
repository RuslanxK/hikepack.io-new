import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark text-center px-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Oops, something went <br /> wrong!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        We're sorry, but an unexpected error has occurred. Please try again later
        or contact support if the issue persists.
      </p>
      <Button onClick={handleNavigateHome} className="px-6 py-2 text-sm text-white">
        Go Back to Homepage
      </Button>
    </div>
  );
};

export default ErrorPage;
