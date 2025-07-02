import React, { Fragment, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Save } from "lucide-react";
import { Button } from "../ui/button";
import LoadingPage from "../loader";
import { Article } from "@/types/article";
import { fetchArticleById, updateArticleById } from "@/lib/api";
import { useUser } from "@/context/user-context";


const ArticleInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

    const { user } = useUser(); 


  const { data: article, isLoading, isError, error } = useQuery<Article, Error>({
    queryKey: ["articleById", id],
    queryFn: () => fetchArticleById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (updatedDescription: string) =>
      updateArticleById(id!, { description: updatedDescription }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articleById", id] }); // ✅ FIX
      setIsEditing(false);
    },
  });

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    if (descriptionRef.current) {
      const updatedHtml = descriptionRef.current.innerHTML;
      mutation.mutate(updatedHtml);
    }
  };

  if (isLoading) return <LoadingPage />;
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
      <div className="bg-white dark:bg-dark-box p-5 rounded-lg flex justify-between items-center w-full">
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

         <h1 className="text-xl font-semibold flex items-center gap-2 break-words leading-snug" title={article.title}>{article.title}</h1>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box blog relative">
        <img
          src={article.imageUrl || "/article-placeholder.webp"}
          alt={article.title}
          className="w-full rounded-lg mb-5"
        />

        
        <p className="text-sm dark:text-white mb-4 bg-secondary/20 rounded-sm px-5 py-1 text-secondary w-fit">
          Posted on: {formattedDate}
        </p>

          {user?.isAdmin && (
          <div className="py-3 mb-2 w-fit">
            {isEditing && (
              <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                ✏️ Editing mode enabled
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" /> Edit Description
                </>
              )}
            </Button>
          </div>
        )}

  


        <div
          ref={descriptionRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          className={`min-h-[150px] transition-all duration-200 ${
            isEditing
              ? "border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded shadow-sm"
              : ""
          }`}
          dangerouslySetInnerHTML={{ __html: article.description }}
        />
      </div>
    </Fragment>
  );
};

export default ArticleInner;







 