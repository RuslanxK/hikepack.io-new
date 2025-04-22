import React from "react";
import { Weight, Package, Boxes } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { LatestBagItem} from "@/types/bag"

interface LastBagStatusProps {
  user?: { weightOption?: string, totalBaseWeight?: string } | null;
  bag?: LatestBagItem
}

const LastBagStatus: React.FC<LastBagStatusProps> = ({ user, bag }) => {

  const navigate = useNavigate()

  const latestBagNavigate = () => {

      navigate(`/bag/${bag?._id}`)
  }



  const weightUnit = user?.weightOption
  const stats = [
    {
      title: "Total Weight",
      icon: <Weight className="w-9 h-9 text-primary" />,
      value: `${bag?.totalBaseWeight} / ${bag?.goal} ${weightUnit}`,
    },
    {
      title: "Total Categories",
      icon: <Package className="w-9 h-9 text-primary" />,
      value: bag?.totalCategories,
    },
    {
      title: "Total Items",
      icon: <Boxes className="w-9 h-9 text-primary" />,
      value: bag?.totalItems,
    },
  ];

  return (
    <div className="h-screen md:h-fit my-10">
      <h2 className="text-lg font-semibold text-center">
        My Last Bag Status <Button variant="link" className="p-0 text-lg" onClick={latestBagNavigate}>{bag?.name}</Button>
      </h2>
      <p className="text-center mb-4">
        Streamline Your Gear, Simplify Your Adventure.
      </p>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 h-44 max-w-[900px] mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-10 bg-white dark:bg-dark-box rounded-lg flex flex-col justify-center"
          >
            <div className="mb-5">{stat.icon}</div>
            <h3 className="text-md font-semibold text-black dark:text-gray-100">
              {stat.title}
            </h3>
            <p className="text-lg text-black dark:text-gray-300 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default LastBagStatus;
