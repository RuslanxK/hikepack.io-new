import React, { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import LoadingPage from "../loader";
import { Article } from "@/types/article";
import { fetchArticleById } from "@/lib/api";


const ArticleInner: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  const { data: article, isLoading, isError, error } = useQuery<Article, Error>({
    queryKey: ["articleById", id],
    queryFn: () => fetchArticleById(id!),
    enabled: !!id, 
  });

  const handleNavigateBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !article) {
    console.error(error);
    navigate("/error");
    return null;
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <Fragment>
      <div className="bg-white dark:bg-dark-box p-5 rounded-lg flex justify-between items-center">
        <div className="flex items-center gap-2 ">

          <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigateBack}
            className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
          </div>

         <h1
  className="text-lg font-semibold flex items-center gap-2 break-words leading-snug"
  title={article.title}
>
  {article.title.length > 50 ? article.title.slice(0, 50) + "..." : article.title}
</h1>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box blog">
        <img
           src={article.imageUrl || "/article-placeholder.webp"}
          alt={article.title}
          className="w-full  object-cover rounded-lg mb-5"/>
       <p className="text-sm text-black dark:text-white mb-4">Posted on: {formattedDate}</p>
       <div dangerouslySetInnerHTML={{ __html: article.description }}></div>
      </div>
    </Fragment>
  );
};

export default ArticleInner;
