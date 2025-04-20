import BagDetails from "@/components/bags/bag-details";
import Container from "@/components/ui/container";
import { useParams } from "react-router-dom";
import { fetchOwnerAndTripByBagId } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/loader";
import { SharedData } from "@/types/share";

const ShareMain = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery<SharedData>({
    queryKey: ["owner-and-trip", id],
    queryFn: () => fetchOwnerAndTripByBagId(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-center text-red-500">Failed to load owner and trip details.</p>;

  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
    <div className="w-4/5 m-auto">
      <div className="flex flex-col mb-5 bg-transparent dark:bg-transparent">
        <div className="flex items-center bg-white rounded-lg gap-4 p-6">
          <img
            src={data?.user.imageUrl || "/default-profile-placeholder.png"}
            alt={data?.user.username}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {data?.user.username}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{data?.user.country}</p>
          </div>
        </div>
        <div className="flex items-start mt-5 rounded-lg p-6 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{data?.trip.name}</h2>
            {data?.trip.about && (
              <p className="text-gray-600 dark:text-gray-400 mb-3">{data?.trip.about}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(data?.trip?.startDate)} → {formatDate(data?.trip?.endDate)}
            </p>
          </div>
        </div>
      </div>
      <BagDetails />
    </div>
  </Container>
  );
};

export default ShareMain;
