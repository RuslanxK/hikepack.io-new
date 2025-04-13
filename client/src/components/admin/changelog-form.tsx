import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '../../lib/apiService'; 
import { useToast } from '@/hooks/use-toast'; 

const ChangeLogForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addChangeLogMutation = useMutation({
    mutationFn: (newChangeLog: { title: string; description: string }) =>
      apiService.post('/changelogs', newChangeLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelogs'] });
      toast({
        title: 'Success',
        variant: "success",
        description: 'Changelog added successfully!',
      });
      setTitle('');
      setDescription('');
   
    },
    onError: (error) => {
      toast({
        title: 'Error',
        variant: "destructive",
        description: `Failed to add changelog: ${error.message}`,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addChangeLogMutation.mutate({ title, description });
  };

  return (
    <div className="bg-white dark:bg-dark-box p-8 rounded-lg mt-5">
      <h1 className="text-lg font-semibold mb-4">Submit a Changelog</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="changelog-title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <Input
            id="changelog-title"
            type="text"
            required
            placeholder="Enter changelog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 dark:bg-dark-item"
          />
        </div>
        <div>
          <label
            htmlFor="changelog-description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <Textarea
            id="changelog-description"
            placeholder="Enter changelog description"
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 resize-none dark:bg-dark-item"
            rows={9}
          />
        </div>
        <Button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-lg"
          disabled={addChangeLogMutation.isPending}>
          {addChangeLogMutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

export default ChangeLogForm;
