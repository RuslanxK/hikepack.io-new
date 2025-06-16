import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { User } from "@/types/login";
import LoadingPage from "../loader";
import { useSearch } from "@/context/search-context";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function TableUsers() {
  const navigate = useNavigate();
  const { userSearchTerm, setUserSearchTerm } = useSearch();
const queryClient = useQueryClient();


 const toggleMutation = useMutation({
    mutationFn: async (userId: string) =>
      await apiService.put(`/user/toggle-active/${userId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });


  const { data: users, isLoading, isError, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => await apiService.get<User[]>("/user/all"),
  });

  if (isLoading) return <LoadingPage />;
  if (isError || error) {
    console.error(error);
    navigate("/error");
  }
  
  

  const filteredUsers = users?.filter((user) =>
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );




  return (
    <Fragment>
      {/* Search and total users display */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="font-semibold">Total Users: {filteredUsers?.length || 0}</span>
        <Input
          type="text"
          placeholder="Search by email or username"
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          className="w-full sm:w-80 border border-light"
        />
      </div>

      {/* Scrollable horizontal area with visible scroll bar */}
      <div className="w-full overflow-x-auto border rounded-lg dark:border-dark-box">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Picture</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Status</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <img
                      src={user.imageUrl || "./default-profile-placeholder.png"}
                      alt="Profile"
                      className="w-9 h-9 object-cover rounded-full"
                    />
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username || "N/A"}</TableCell>
                  <TableCell>{user.country || "N/A"}</TableCell>
                  <TableCell>{user.gender || "N/A"}</TableCell>
                  <TableCell>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {user.lastLoggedIn
                      ? new Date(user.lastLoggedIn).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>{user.verified ? "Yes" : "No"}</TableCell>
                  <TableCell>
  <Button
  className={`text-white px-4 rounded-full ${
    user.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
  }`}
  onClick={() => {
    if (user._id) toggleMutation.mutate(user._id);
  }}
  disabled={user.isAdmin}
>
  {user.isActive ? "Deactivate" : "Activate"}
</Button>

</TableCell>

                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Fragment>
  );
}
