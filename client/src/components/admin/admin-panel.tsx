import { Fragment } from "react/jsx-runtime";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChartAdmin } from "../charts/LineChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableUsers } from "./table-users";
import ChangeLogForm from "./changelog-form";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateBack = (): void => {
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
          <h1 className="text-lg font-semibold flex items-center gap-2 ml-2 truncate w-full overflow-hidden text-ellipsis">
            Admin Panel
          </h1>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg mt-5 dark:bg-dark-box">
        <p className="text-gray-700 dark:text-gray-300">
          Manage users, update changelogs, and control application settings from one central dashboard.
        </p>
      </div>

    
      <Tabs defaultValue="chart" className="mt-5">
        <TabsList className="gap-4 dark:bg-dark p-2 rounded-lg">
          <TabsTrigger
            value="chart"
            className="px-6 py-2 rounded-lg font-medium bg-white dark:bg-dark-box hover:shadow-md focus:shadow-md border dark:border-dark-nav transition"
          >
            Chart
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="px-6 py-2 rounded-lg font-medium bg-white dark:bg-dark-box hover:shadow-md focus:shadow-md border dark:border-dark-nav transition"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="changelog"
            className="px-6 py-2 rounded-lg font-medium bg-white dark:bg-dark-box hover:shadow-md focus:shadow-md border dark:border-dark-nav transition"
          >
            ChangeLog
          </TabsTrigger>
        </TabsList>

    
        <TabsContent value="chart" className="mt-5">
          <div className="p-5 bg-white rounded-lg dark:bg-dark-box">
            <LineChartAdmin />
          </div>
        </TabsContent>
        <TabsContent value="users" className="mt-5">
          <div className="p-5 bg-white rounded-lg dark:bg-dark-box">
           <TableUsers />
          </div>
        </TabsContent>
        <TabsContent value="changelog" className="mt-5">
        <ChangeLogForm />
        </TabsContent>
      </Tabs>
    </Fragment>
  );
};

export default AdminPanel;
