import React, { Fragment, useCallback} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRightCircle, Trash2 } from "lucide-react";
import { Article } from "@/types/article";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";
import DeleteAlert from "../ui/delete-alert";
import { useState } from "react";
import { useUser } from '@/context/user-context';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article }) => {

const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: string) =>
      apiService.delete(`/articles/${articleId}`),
    onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ["articles"]}); 
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: `Failed to delete the article: ${error.message}`,
      });
    },
  });

  const confirmDelete = () => {
    deleteArticleMutation.mutate(article._id); 
  };


    const cancelDelete = useCallback(() => {
      setShowDeleteAlert(false);
    }, []);


  return (

    <Fragment>
    <div
      key={article._id}
      className="rounded-lg dark:bg-dark-box bg-white cursor-pointer shadow-lg"
    >
      <img
        src={article.imageUrl || "/article-placeholder.webp"}
        alt={article.title}
        onClick={() => navigate(`/article/${article._id}`)}
        className="w-full h-40 object-cover rounded-t-lg mb-3"
      />
      <div className="px-2 pb-4 flex items-center justify-between">
        <h3
          className="px-2 text-gray-800 dark:text-gray-200 truncate"
          title={article.title}
        >
          {article.title}
        </h3>
        <div className="flex space-x-3 px-2">
          <button
            title="Navigate"
            onClick={() => navigate(`/article/${article._id}`)}
          >
            <ArrowRightCircle className="w-4 h-4 hover:text-primary" />
          </button>
          {user?.isAdmin ? <button title="Delete" onClick={() => setShowDeleteAlert(true)} disabled={deleteArticleMutation.isPending}>
          <Trash2 className={`w-4 h-4 ${ deleteArticleMutation.isPending ? "text-gray-400" : "hover:text-red-500" }`} /> 
          </button> : null}
        </div>
      </div>
    </div>

<DeleteAlert isOpen={showDeleteAlert} description={`Are you sure you want to delete "${article?.title}"? This action cannot be undone.`} onConfirm={confirmDelete} onCancel={cancelDelete} isDeleting={deleteArticleMutation.isPending} />
</Fragment>
  );
});

export default ArticleCard;
