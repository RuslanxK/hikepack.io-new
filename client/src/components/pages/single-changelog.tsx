import React from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { SingleChangeLogProps } from "@/types/changelog";


const SingleChangeLog: React.FC<SingleChangeLogProps> = ({ log, user }) => {

  const { isAdmin } = user; 

  const queryClient = useQueryClient();

  const deleteChangeLogMutation = useMutation({
    mutationFn: async () => {
      await apiService.delete(`/changelogs/${log._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["changelogs"]}); 
    },
    onError: (error) => {
      console.error("Error deleting changelog:", error);
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this changelog?")) {
      deleteChangeLogMutation.mutate();
    }
  };

  return (
    <div className="border-b dark:border-zinc-600 pb-4 flex items-start gap-4">
      <CheckCircle className="w-6 h-6 text-primary mt-1" />
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-black dark:text-gray-200">
          {log.title}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-400">
          {log.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
          {new Date(log.createdAt).toLocaleDateString()}
        </p>
      </div>
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="ml-auto"
          disabled={deleteChangeLogMutation.isPending}>
          <Trash2 className="w-4 h-4 hover:text-red-500" />
        </button>
      )}
    </div>
  );
};

export default SingleChangeLog;
