import React, { Fragment, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";


const ReportBug: React.FC = () => {
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, description });
    setTitle('');
    setDescription('');
  };


  const handleNavigateBack = () => {
    navigate(-1);
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
          <h1 className="text-lg font-semibold flex items-center gap-2 ml-2 truncate overflow-hidden text-ellipsis">
           Report a bug
          </h1>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box">
        <p className="text-black dark:text-gray-300">
          Please provide details about the issue you're experiencing.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-box p-8 rounded-lg mt-5">
        <h1 className="text-lg font-semibold mb-4">Report a Bug</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="bug-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bug Title
            </label>
            <Input
              id="bug-title"
              type="text"
              placeholder="Enter a brief title for the bug"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 dark:bg-dark-item"
            />
          </div>
          <div>
            <label htmlFor="bug-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              id="bug-description"
              placeholder="Provide a detailed description of the bug"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 resize-none dark:bg-dark-item"
              rows={9}
            />
          </div>
          <Button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">
            Submit
          </Button>
        </form>
      </div>
    </Fragment>
  );
};

export default ReportBug;
