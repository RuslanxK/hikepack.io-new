import React from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CommunityBag } from "@/types/community";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearch } from "@/context/search-context";

interface CommunityTableProps {
  data: CommunityBag[];
}

export const CommunityTable: React.FC<CommunityTableProps> = ({ data }) => {
  const { bagSearchTerm, setBagSearchTerm } = useSearch();

  const navigate = useNavigate();

  const filteredData = data.filter((bag) =>
    bag.bagName.toLowerCase().includes(bagSearchTerm.toLowerCase()) ||
    bag.ownerName.toLowerCase().includes(bagSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder="Search"
          type="search"
          value={bagSearchTerm}
          onChange={(e) => setBagSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <ScrollArea className="max-h-screen overflow-auto w-full rounded-md border p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Picture & Name</TableHead>
              <TableHead>Bag Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Likes</TableHead>
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
                  <TableCell className="flex items-center gap-4">
                    <img
                      src={bag.ownerImageUrl || "/default-profile-placeholder.png"}
                      alt={bag.ownerName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span>{bag.ownerName}</span>
                  </TableCell>
                  <TableCell>{bag.bagName}</TableCell>
                  <TableCell>{bag.bagDescription}</TableCell>
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
      </ScrollArea>
    </div>
  );
};
