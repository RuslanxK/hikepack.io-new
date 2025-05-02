import React, { Fragment, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Cookies from 'js-cookie';


const ReportBug: React.FC = () => {
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!title || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out both the topic and the description.",
      });
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: Cookies.get("token") || "",
        },
        body: JSON.stringify({ title, description }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || "Failed to send report");
  
      toast({
        title: "Report Sent",
        description: "Thanks! We'll review your message shortly.",
      });
  
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Report submission failed:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Unable to send your report. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
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
           Contact us
          </h1>
        </div>
      </div>

     
      <div className="bg-white dark:bg-dark-box p-8 rounded-lg mt-5">
        <h1 className="text-xl font-semibold mb-4"> Let us know what you're reaching out about!</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
        <Label htmlFor="bug-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Choose an option
</Label>
<Select onValueChange={setTitle} required value={title}>
  <SelectTrigger className="mt-2 w-full rounded-lg dark:bg-dark-item bg-gray-100">
    <SelectValue placeholder="Select a topic" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Support">Support</SelectItem>
    <SelectItem value="Report a Bug">Report a Bug</SelectItem>
    <SelectItem value="Feature Request">Feature Request</SelectItem>
    <SelectItem value="Other">Other</SelectItem>
  </SelectContent>
</Select>

  <div>
    <label htmlFor="bug-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Description
    </label>
    <Textarea
      id="bug-description"
      required
      placeholder="Provide a detailed description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="mt-2 resize-none dark:bg-dark-item"
      rows={9}
    />
  </div>

  <Button
  type="submit"
  className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50"
  disabled={loading}
>
  {loading ? "Submitting..." : "Submit"}
</Button>
</form>
      </div>
    </Fragment>
  );
};

export default ReportBug;
