import { Fragment } from "react/jsx-runtime";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChartAdmin } from "../charts/LineChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableUsers } from "./table-users";
import ChangeLogForm from "./changelog-form";


interface AdminPanelProps {
  liveUsers: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ liveUsers }) => {

  const navigate = useNavigate();

  const handleNavigateBack = (): void => {
    navigate(-1);
  };


  return (
    <Fragment>
      <div className="bg-white dark:bg-dark-box p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center gap-2 w-full sm:w-8/12">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigateBack}
            className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold truncate ml-2">
            Admin Panel
          </h1>
        </div>
      </div>

      <div className="p-4 sm:p-5 bg-white rounded-lg mt-4 dark:bg-dark-box">
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
          Manage users, update changelogs, and control application settings from one central dashboard.
        </p>
      </div>

      <Tabs defaultValue="chart" className="mt-5 w-full">
        <TabsList className="flex flex-wrap gap-2 sm:gap-4 dark:bg-dark p-2 rounded-lg">
          <TabsTrigger
            value="chart"
            className="flex-1 sm:flex-initial px-4 py-2 text-sm sm:text-base rounded-lg font-medium bg-white dark:bg-dark-box hover:shadow-md border dark:border-dark-nav"
          >
            Chart
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex-1 sm:flex-initial px-4 py-2 text-sm sm:text-base rounded-lg font-medium bg-white dark:bg-dark-box hover:shadow-md border dark:border-dark-nav"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="changelog"
            className="flex-1 sm:flex-initial px-4 py-2 text-sm sm:text-base rounded-lg font-medium bg-white dark:bg-dark-box hover:shadow-md border dark:border-dark-nav"
          >
            ChangeLog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-4 sm:mt-5">
          <div className="p-4 sm:p-5 bg-white rounded-lg dark:bg-dark-box">
            <LineChartAdmin liveUsers={liveUsers} />
          </div>
        </TabsContent>
        <TabsContent value="users" className="mt-4 sm:mt-5">
          <div className="p-4 sm:p-5 bg-white rounded-lg dark:bg-dark-box">
            <TableUsers />
          </div>
        </TabsContent>
        <TabsContent value="changelog" className="mt-4 sm:mt-5">
          <ChangeLogForm />
        </TabsContent>
      </Tabs>
    </Fragment>
  );
};

export default AdminPanel;
