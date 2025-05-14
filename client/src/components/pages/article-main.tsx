import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Article } from "@/types/article";
import LoadingPage from "../loader";
import Grid from "../ui/grid";
import { Fragment } from "react/jsx-runtime";
import ArticleCard from "./article-card";
import { fetchArticles } from "@/lib/api";

const ArticleMain: React.FC = () => {
  
  const navigate = useNavigate();

  const { data: articles = [], isLoading, isError, error } = useQuery<Article[], Error>({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

  const handleNavigateBack = () => {
    navigate(-1);
  };

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
            Articles
          </h1>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box border">
        <p className="text-black dark:text-gray-300">
          Explore expert tips, detailed guides, and inspiring adventures to elevate your journey and fuel your passion for discovery.
        </p>
      </div>

      <div className="rounded-lg mt-5">
        {articles?.length > 0 ? (
           <Grid>
           {articles.map((article) => (
             <ArticleCard key={article._id} article={article} />
           ))}
         </Grid>
        ) : (
          !isLoading && (
            <p className="text-gray-700 dark:text-gray-300">
              No articles found. Check back later for updates!
            </p>
          )
        )}
      </div>
    </Fragment>
  );
};

export default ArticleMain;
