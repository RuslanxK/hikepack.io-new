import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommunityBag } from "@/types/community";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearch } from "@/context/search-context";

interface CommunityTableProps {
  data: CommunityBag[];
}

export const CommunityTable: React.FC<CommunityTableProps> = ({ data }) => {
  const { bagSearchTerm, setBagSearchTerm } = useSearch();
  const navigate = useNavigate();

  const filteredData = data.filter(
    (bag) =>
      bag.bagName.toLowerCase().includes(bagSearchTerm.toLowerCase()) ||
      bag.ownerName.toLowerCase().includes(bagSearchTerm.toLowerCase())
  ).sort((a, b) => b.likes - a.likes)


  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
  };

  return (
    <div className="space-y-5">
      <div className="relative w-full">
        <Input
          placeholder="Search"
          type="search"
          value={bagSearchTerm}
          onChange={(e) => setBagSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Responsive table container */}
      <div className="overflow-x-auto w-full rounded-md border dark:border-gray-700">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Picture & Name</TableHead>
              <TableHead className="min-w-[150px]">Bag Name</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="min-w-[100px]">Categories</TableHead>
              <TableHead className="min-w-[100px]">Items</TableHead>
              <TableHead className="min-w-[100px]">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((bag) => (
                <TableRow
                  key={bag.bagId}
                  onClick={() => navigate(`/share/${bag.bagId}`)}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-box"
                >
            <TableCell className="flex items-center gap-4 whitespace-nowrap">
  <img
    src={bag.ownerImageUrl || "/default-profile-placeholder.png"}
    alt={bag.ownerName}
    className="w-9 h-9 rounded-full object-cover"
  />
  <span className="truncate max-w-[100px]">
    {truncate(bag.ownerName, 20)}
  </span>
</TableCell>

<TableCell className="whitespace-nowrap truncate">
  {truncate(bag.bagName, 30)}
</TableCell>

<TableCell className="whitespace-nowrap truncate max-w-[200px]">
  {truncate(bag.bagDescription, 50)}
</TableCell>
                  <TableCell>{bag.categoriesCount}</TableCell>
                  <TableCell>{bag.itemsCount}</TableCell>
                  <TableCell>{bag.likes}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No matching results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>Total bags: {filteredData.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};
