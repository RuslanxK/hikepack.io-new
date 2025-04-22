import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CommunityTable } from "../tables/community-table";
import { fetchCommunityBags } from "@/lib/api";
import { Fragment } from "react/jsx-runtime";
import LoadingPage from "../loader";

const Community = () => {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const { data: communityBags = [], isLoading, isError, error } = useQuery({
    queryKey: ["communityBags"],
    queryFn: fetchCommunityBags,
  });

  if (isLoading) return <LoadingPage />

  if (isError || error) {
    console.error(error);
    navigate("/error");
  }

  return (
    <Fragment>
      <div className="bg-white dark:bg-dark-box p-5 rounded-lg flex justify-between items-center">
        <div className="flex items-center gap-2 w-8/12">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigateBack}
            className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2 ml-2 truncate  overflow-hidden text-ellipsis">
            Community
          </h1>
        </div>
      </div>
      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box">
        <p className="text-black dark:text-gray-300">
          Discover top-rated bags for every journey. Whether you're conquering remote peaks or exploring dense forests, find your perfect companion.
        </p>
      </div>
      <div className="rounded-lg mt-5 bg-white dark:bg-dark-box p-5">
        <CommunityTable data={communityBags} />
      </div>
    </Fragment>
  );
};

export default Community;
