"use client";

import React, { useState, useMemo, useCallback} from "react";
import DonutChart from "@/components/charts/DonutChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Shirt, Layers } from "lucide-react";
import { Category } from "@/types/category";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/context/user-context";


const WEIGHT_CONVERSION = {
  lb: { lb: 1, kg: 0.45359237, g: 453.59237, oz: 16 },
  kg: { lb: 2.2046226218, kg: 1, g: 1000, oz: 35.27396195 },
  g: { lb: 0.0022046226, kg: 0.001, g: 1, oz: 0.03527396195 },
  oz: { lb: 0.0625, kg: 0.0283495231, g: 28.3495231, oz: 1 },
};

interface ChartWithTableProps {
  categories: Category[];
  goal?: string;
}

const ChartWithTable: React.FC<ChartWithTableProps> = ({ categories, goal }) => {
  const { user } = useUser();
  const [weightUnit, setWeightUnit] = useState<keyof typeof WEIGHT_CONVERSION>(user?.weightOption || "lb");

  const convertWeight = useCallback(
    (value: string | number, fromUnit: keyof typeof WEIGHT_CONVERSION, toUnit: keyof typeof WEIGHT_CONVERSION): number => {
      const weight = typeof value === "number" ? value : parseFloat(value);
      return weight * WEIGHT_CONVERSION[fromUnit][toUnit];
    },
    []
  );

  const { totalBaseWeight, totalWornWeight, totalWeight, convertedCategories } = useMemo(() => {

    const convertedCategories = categories.map((category) => {
      const baseWeight = category.items?.reduce((acc, item) => {
        const weight = parseFloat(item.weight?.toString() || "0");
        const qty = parseFloat(item.qty?.toString() || "1");
        const fromUnit = (item.weightOption || user?.weightOption || "lb") as keyof typeof WEIGHT_CONVERSION;


        const convertedWeight = convertWeight(weight, fromUnit, weightUnit) * qty;

        return item.worn ? acc : acc + convertedWeight;
      }, 0) as number;

      const wornWeight = category?.items?.reduce((acc, item) => {
        const weight = parseFloat(item.weight?.toString() || "0");
        const qty = parseFloat(item.qty?.toString() || "1");
        const fromUnit = (item.weightOption || user?.weightOption || "lb") as keyof typeof WEIGHT_CONVERSION;


        const convertedWeight = convertWeight(weight, fromUnit, weightUnit) * qty;

        return item.worn ? acc + convertedWeight : acc;
      }, 0) as number;

      const totalWeightConverted = baseWeight + wornWeight;

      return {
        ...category,
        baseWeight: baseWeight.toFixed(2),
        wornWeight: wornWeight.toFixed(2),
        totalWeight: totalWeightConverted.toFixed(2),
      };
    });

    const totalBaseWeight = convertedCategories.reduce((acc, category) => acc + parseFloat(category.baseWeight), 0);
    const totalWornWeight = convertedCategories.reduce((acc, category) => acc + parseFloat(category.wornWeight), 0);
    const totalWeight = totalBaseWeight + totalWornWeight;

    return { totalBaseWeight, totalWornWeight, totalWeight, convertedCategories };
  }, [categories, weightUnit, user?.weightOption, convertWeight]);

  const chartData = convertedCategories.map((category) => ({
    name: category.name || "Unnamed Category",
    weight: parseFloat(category.totalWeight),
    fill: category.color || "#B0BEC5",
  }));



  return (
    <div className="flex flex-row justify-center items-center w-full gap-6 bg-white dark:bg-dark-box md:p-6 pt-6 pb-6 rounded-lg">
      <div className="grid items-between md:flex md:flex-row">
        <div className="flex justify-center gap-4 md:flex md:flex-col text-left pb-5 md:pb-0">
     <div className="flex items-start gap-3 w-full max-w-xs">
  {/* Icon box */}
  <div className="flex-none w-8 h-8 flex items-center justify-center bg-blue-100 rounded-md">
    <Package size={20} className="text-blue-500" />
  </div>

  {/* Text + Progress */}
  <div className="flex flex-col w-full">
    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Base</h4>

    <div className="flex items-center justify-start mb-2">
      <span className="text-sm text-gray-500">{totalBaseWeight.toFixed(2)} {weightUnit}</span>
      <span className="text-sm text-gray-400 mx-2">/</span>
      <span className="text-sm text-gray-500">{goal} {user?.weightOption}</span>
    </div>

   {goal && !isNaN(Number(goal)) && (() => {
  // Use consistent unit for percentage logic
  const userUnit = (user?.weightOption || "lb") as keyof typeof WEIGHT_CONVERSION;

  const baseWeightInUserUnit = convertWeight(totalBaseWeight, weightUnit, userUnit);
  const goalWeightInUserUnit = parseFloat(goal);

  const percentage = (baseWeightInUserUnit / goalWeightInUserUnit) * 100;
  const isOver = percentage > 100;
  const safePercent = Math.min(percentage, 100).toFixed(0);

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-medium ${isOver ? "text-red-500" : "text-gray-500"}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`${isOver ? "bg-red-500" : "bg-primary"} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </>
  );
})()}
  </div>
</div>


      <div className="flex items-start gap-3 w-full max-w-xs">
    <div className="flex-none w-8 h-8 flex items-center justify-center bg-green-100 rounded-md">
      <Shirt size={20} className="text-green-500" />
    </div>
    <div className="flex flex-col w-full">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Worn</h4>
      <span className="text-sm text-gray-500">{totalWornWeight.toFixed(2)} {weightUnit}</span>
    </div>
  </div>

       <div className="flex items-start gap-3 w-full max-w-xs">
    <div className="flex-none w-8 h-8 flex items-center justify-center bg-orange-100 rounded-md">
      <Layers size={20} className="text-orange-500" />
    </div>
    <div className="flex flex-col w-full">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Total</h4>
      <span className="text-sm text-gray-500">{totalWeight.toFixed(2)} {weightUnit}</span>
    </div>
  </div>
</div>
      <div className="flex items-center">
        <DonutChart chartData={chartData} />
      </div>

      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Color</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-right">
                <Select value={weightUnit} onValueChange={(value) => setWeightUnit(value as keyof typeof WEIGHT_CONVERSION)}>
                  <SelectTrigger className="w-16 h-8 dark:bg-dark">
                    <SelectValue>{weightUnit}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {convertedCategories.map((category) => (
              <TableRow key={category._id}>
                <TableCell className="text-center">
                  <div className="w-4 h-4 rounded-full mx-auto" style={{ backgroundColor: category.color }} />
                </TableCell>
                <TableCell className="font-medium">{category.name || "Unnamed Category"}</TableCell>
                <TableCell className="text-right">{category.totalWeight || 0} {weightUnit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  );
};

export default ChartWithTable;
