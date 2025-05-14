import React, { Fragment } from "react";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChangeLog as ChangeLogType } from "@/types/changelog";
import LoadingPage from "../loader";
import { fetchChangeLogs } from "@/lib/api";
import SingleChangeLog from "./single-changelog";
import { useUser } from "@/context/user-context";

const ChangeLog: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser(); 
  const handleNavigateBack = () => {
    navigate(-1);
  };

  const { data: changelogData, isLoading, isError, error } = useQuery({
    queryKey: ["changelogs"],
    queryFn: fetchChangeLogs,
  });

  if (isLoading) return <LoadingPage />

  if (isError || error) {
    console.error(error);
    navigate("/error");
  }

  return (
    <Fragment>
      <div className="bg-white dark:bg-dark-box p-5 rounded-lg flex justify-between items-center border">
        <div className="flex items-center gap-2 w-8/12">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigateBack}
            className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2 ml-2 truncate overflow-hidden text-ellipsis">
            ChangeLog
          </h1>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box border">
        <p className="text-black dark:text-gray-300">
          View the latest updates, fixes, and features added to the app to
          enhance your experience.
        </p>
      </div>

     {changelogData?.length ?  <div className="p-8 bg-white rounded-lg mt-5 dark:bg-dark-box space-y-4 border">
        {changelogData?.map((log: ChangeLogType) => (
          <SingleChangeLog key={log._id} log={log} user={user || {}} />
        ))}
      </div> : null }

    </Fragment>
  );
};

export default ChangeLog;
