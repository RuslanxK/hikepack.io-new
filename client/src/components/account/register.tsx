import { useState } from "react";
import StepAccount from "./steps/stepAccount";
import StepPassword from "./steps/stepPassword";
import StepProfile from "./steps/stepProfile";
import StepPersonal from "./steps/stepPersonal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { FormData as FormFields } from "../../types/form";
import { apiService } from "@/lib/apiService";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const steps = [
  {
    name: "Account Details",
    description: "Provide your email and username to create an account.",
    component: StepAccount,
  },
  {
    name: "Password",
    description: "Set a password and confirm it for your account.",
    component: StepPassword,
  },
  {
    name: "Profile Photo",
    description: "Upload a profile photo for your account.",
    component: StepProfile,
  },
  {
    name: "Personal Information",
    description: "Provide your country, birthdate, gender, and other details.",
    component: StepPersonal,
  },
];


const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [formData, setFormData] = useState<FormFields>({
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
    imageUrl: null,
    country: '',
    birthdate: "",
    gender: "",
    distance: "",
    weightOption: "",
    activityLevel: "",
  });


  const navigate = useNavigate()

  const StepComponent = steps[currentStep].component;

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateFormData = (newData: Partial<FormFields>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {

    const newFormData = new FormData();
    newFormData.append("email", formData.email);
    newFormData.append("username", formData.username);
    newFormData.append("password", formData.password);
    newFormData.append("repeatPassword", formData.repeatPassword);
    newFormData.append("country", formData.country);
    newFormData.append("birthdate", formData.birthdate);
    newFormData.append("gender", formData.gender);
    newFormData.append("distance", formData.distance);
    newFormData.append("weightOption", formData.weightOption);
    newFormData.append("activityLevel", formData.activityLevel);
  
    if (formData.imageUrl) {
      newFormData.append("imageUrl", formData.imageUrl);
    }
  
    createUserMutation.mutate(newFormData);
  };
  

  const createUserMutation = useMutation({
    mutationFn: (data: FormData) => apiService.post("/user/register", data, { headers: {"Content-Type": "multipart/form-data"}}),
    onSuccess: () => {
      navigate('/login')
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      setErrorMessage(error?.message);
    },
  });

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-dark-box text-black dark:text-white">
  {/* Left Section */}
  <div className="flex flex-col h-full p-6 md:p-10 justify-center">
   
    <div className="flex flex-col justify-center h-full">

       <div className="mb-6">
      {/* Logo: light/dark */}
      <img src="/logo-black.png" width={85} alt="Logo" className="block dark:hidden" />
      <img src="/logo-white.png" width={85} alt="Logo" className="hidden dark:block" />
    </div>

      <div className="flex-1 flex items-center justify-center mt-10">
        <div className="w-full max-w-sm">
          {errorMessage && (
            <div className="mb-5">
              <ErrorAlert message={errorMessage} />
            </div>
          )}


           <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-1">{steps[currentStep].name}</h1>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          {steps[currentStep].description}
        </p>
      </div>

      <div className="flex justify-center mb-5">
        <Progress
          value={progressPercentage}
          className="h-2 rounded-md max-w-sm bg-gray-200 dark:bg-gray-400"
        />
      </div>

          <StepComponent
            formData={formData}
            updateFormData={updateFormData}
            setIsNextDisabled={setIsNextDisabled}
          />

          <div className="flex flex-col justify-between mt-6">
            <Button
              variant="outline"
              className="mb-4 dark:bg-dark dark:text-white dark:border-dark-box hover:dark:bg-black"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                className="text-white bg-primary dark:bg-primary dark:hover:bg-primary/80"
                onClick={nextStep}
                disabled={isNextDisabled}
              >
                Next
              </Button>
            ) : (
              <Button
                className="text-white bg-primary dark:bg-primary dark:hover:bg-primary/80"
                onClick={handleSubmit}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.status === "pending"
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            )}
          </div>

          <div className="text-center text-sm mt-4 text-black dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:text-primary dark:hover:text-primary">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Right Section */}
  <div className="relative hidden lg:block">
    <img
      src="/register.webp"
      alt="Register"
      className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
    />
  </div>
</div>
  );
};

export default RegisterPage;
