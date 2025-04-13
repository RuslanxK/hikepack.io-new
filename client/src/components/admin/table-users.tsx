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

export function TableUsers() {

  const navigate = useNavigate()
  const { data: users, isLoading, isError, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => await apiService.get<User[]>("/user/all"),
  });

  const { userSearchTerm, setUserSearchTerm } = useSearch(); 

  if (isLoading) return <LoadingPage />;
  if (isError || error) {
    console.error(error);
    navigate("/error");
  }

  const filteredUsers = users?.filter((user) => user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) || user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()));

  return (
    <Fragment>
      <div className="mb-4 flex items-center justify-between">
      <span className="font-semibold w-3/12">
          Total Users: {filteredUsers?.length || 0}
      </span>
        <Input
          type="text"
          placeholder="Search by email or username"
          value={userSearchTerm} 
          onChange={(e) => setUserSearchTerm(e.target.value)} />
      </div>

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <img src={user.imageUrl || "./default-profile-placeholder.png"} alt="Profile" className="w-9 h-9 object-cover rounded-full"/>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username || "N/A"}</TableCell>
              <TableCell>{user.country || "N/A"}</TableCell>
              <TableCell>{user.gender || "N/A"}</TableCell>
              <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </TableCell>
              <TableCell>{user.lastLoggedIn ? new Date(user.lastLoggedIn).toLocaleDateString() : "Never"}
              </TableCell>
              <TableCell>{user.verified ? "Yes" : "No"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
}
