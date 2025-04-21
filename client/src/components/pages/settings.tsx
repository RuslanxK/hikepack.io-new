import React, { Fragment, useState } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, Calendar as CalendarIcon, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useMutation} from "@tanstack/react-query";
import { User } from "@/types/login";
import { useUser } from "@/context/user-context";
import { isBefore, endOfToday } from "date-fns";
import { apiService } from "@/lib/apiService";


const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const storedUser = localStorage.getItem("user");
  const initialUser = storedUser ? JSON.parse(storedUser) : {};

  const [showCheck, setShowCheck] = useState(false); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<User>({
    _id: initialUser._id || "",
    email: initialUser.email || "",
    username: initialUser.username || "",
    birthdate: initialUser.birthdate || "",
    weightOption: initialUser.weightOption || "lb",
    imageUrl: initialUser.imageUrl || "",
    verified: initialUser.verified ?? false,
    resetPasswordToken: initialUser.resetPasswordToken || null,
    resetPasswordExpires: initialUser.resetPasswordExpires || null,
    distance: initialUser.distance || "miles",
    emailVerificationToken: initialUser.emailVerificationToken || null,
    emailVerificationExpires: initialUser.emailVerificationExpires || null,
    googleId: initialUser.googleId || "",
    gender: initialUser.gender || "other",
    activityLevel: initialUser.activityLevel || "beginner",
    country: initialUser.country || "United States",
    isAdmin: initialUser.isAdmin ?? false, 
    lastLoggedIn: initialUser.lastLoggedIn || null,
    createdAt: initialUser.createdAt || new Date(),
    updatedAt: initialUser.updatedAt || new Date(),
  });
  
  

  const handleNavigateBack = (): void => {
    navigate(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save file to send to backend
  
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>): void => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            imageUrl: event.target?.result as string, // Base64 for preview only
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateUserMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiService.put('/user/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      setUser(formData); 
      localStorage.setItem('user', JSON.stringify(formData));
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });

  
  const handleSaveChanges = () => {
    const formDataToSend = new FormData();
    formDataToSend.append("email", formData.email || "");
    formDataToSend.append("username", formData.username || "");
    formDataToSend.append("birthdate", formData.birthdate || "");
    formDataToSend.append("gender", formData.gender || "");
    formDataToSend.append("country", formData.country || "");
    formDataToSend.append("weightOption", formData.weightOption || "");
    formDataToSend.append("distance", formData.distance || "");
    formDataToSend.append("activityLevel", formData.activityLevel || "");
  
    if (selectedFile) {
      formDataToSend.append("imageUrl", selectedFile); 
    }
  
    updateUserMutation.mutate(formDataToSend);
  };
  
  

  return (
    <Fragment>
      <div className="bg-white dark:bg-dark-box p-5 rounded-lg flex justify-between items-center">
        <div className="flex items-center gap-2 w-8/12">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigateBack}
            className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2 ml-2 truncate w-full overflow-hidden text-ellipsis">
            Settings
          </h1>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box">
        <p className="text-black dark:text-gray-300">Manage your account settings and personal preferences.</p>
      </div>

      <Card className="bg-white dark:bg-dark-box rounded-lg mt-5">
        <CardHeader className="flex flex-row justify-between">
          <h2 className="text-lg font-semibold">Update Account Information</h2>
            <Button variant="link" onClick={handleSaveChanges} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              {showCheck && <CheckCheck className="text-primary mr-2" />}
            </Button>
        </CardHeader>
        <CardContent>
  <div className="flex flex-col lg:flex-row gap-5 dark:bg-dark rounded-lg">
    {/* Profile Image & Upload */}
    <div className="flex flex-col items-center lg:items-start rounded-lg p-5 border w-full lg:w-[280px]">
      <img
        src={formData.imageUrl || "./default-profile-placeholder.png"}
        alt="Profile Preview"
        className="w-28 h-28 object-cover rounded-full border border-gray-300 mb-4"
      />
      <div className="w-full">
        <Label htmlFor="profile-pic">Profile Picture</Label>
        <Input
          id="profile-pic"
          type="file"
          className="mt-2 bg-white w-full"
          onChange={handleProfilePictureChange}
        />
      </div>
    </div>

    {/* Form Fields Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full p-5 border rounded-lg">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Enter your username"
          className="mt-2 bg-white w-full"
          value={formData.username}
          disabled
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="mt-2 bg-white w-full"
          value={formData.email}
          disabled
        />
      </div>

      <div className="space-y-1">
        <Label>Birthdate</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-white dark:bg-dark-box text-left text-sm">
              {formData.birthdate
                ? format(new Date(formData.birthdate), "PPP")
                : "Select Birthdate"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={
                formData.birthdate ? new Date(formData.birthdate) : undefined
              }
              onSelect={(date) => {
                if (date && isBefore(date, new Date())) {
                  const adjustedDate = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                  );
                  setFormData((prev) => ({
                    ...prev,
                    birthdate: adjustedDate.toISOString().split("T")[0],
                  }));
                }
              }}
              disabled={(date) => isBefore(endOfToday(), date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => handleSelectChange("gender", value)}
        >
          <SelectTrigger className="rounded-lg w-full">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Distance Unit</Label>
        <Select
          value={formData.distance}
          onValueChange={(value) => handleSelectChange("distance", value)}
        >
          <SelectTrigger className="rounded-lg w-full">
            <SelectValue placeholder="Select Distance Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="km">Kilometers</SelectItem>
            <SelectItem value="miles">Miles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Weight Unit</Label>
        <Select
          value={formData.weightOption}
          onValueChange={(value) => handleSelectChange("weightOption", value)}
        >
          <SelectTrigger className="rounded-lg w-full">
            <SelectValue placeholder="Select Weight Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">Kilograms</SelectItem>
            <SelectItem value="lb">Pounds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Activity Level</Label>
        <Select
          value={formData.activityLevel}
          onValueChange={(value) => handleSelectChange("activityLevel", value)}
        >
          <SelectTrigger className="rounded-lg w-full">
            <SelectValue placeholder="Select Activity Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          placeholder="Country"
          className="mt-2 bg-white w-full"
          value={formData.country}
          onChange={handleInputChange}
        />
      </div>
    </div>
  </div>
</CardContent>
      </Card>
    </Fragment>
  );
};

export default Settings;
