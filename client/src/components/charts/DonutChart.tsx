"use client";

import React from "react";
import { Pie, PieChart } from "recharts";

interface DonutChartProps {
  chartData?: { name: string; weight: number; fill: string }[]; // Make chartData optional
}

const DonutChart: React.FC<DonutChartProps> = ({ chartData }) => {
  // Default chart data with gray colors
  const defaultData = [
    { name: "Default Base", weight: 40, fill: "#B0BEC5" },
    { name: "Default Worn", weight: 30, fill: "#CFD8DC" },
    { name: "Default Total", weight: 30, fill: "#ECEFF1" },
  ];

  const data = chartData && chartData.some((item) => item.weight > 0) ? chartData : defaultData;

  return (
    <div className="donut-chart" style={{ outline: "none" }}>
      <PieChart width={300} height={250}>
        <Pie
          data={data}
          dataKey="weight"
          nameKey="name"
          innerRadius={60}
          outerRadius={110}
          strokeWidth={1}
          isAnimationActive={false}
        />
      </PieChart>
    </div>
  );
};

export default DonutChart;
