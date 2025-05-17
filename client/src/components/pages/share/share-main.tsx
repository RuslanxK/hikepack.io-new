import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Heart, HeartOff } from "lucide-react";
import Cookies from "js-cookie";

import Container from "@/components/ui/container";
import LoadingPage from "@/components/loader";
import BagDetails from "@/components/bags/bag-details";
import { fetchOwnerAndTripByBagId } from "@/lib/api";
import { SharedData } from "@/types/share";

const ShareMain = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [liked, setLiked] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);

  const { data, isLoading, error } = useQuery<SharedData>({
    queryKey: ["owner-and-trip", id],
    queryFn: () => fetchOwnerAndTripByBagId(id!),
    enabled: !!id,
  });


  useEffect(() => {
    if (id) {
      const likedBags = JSON.parse(localStorage.getItem("likedBags") || "[]");
      setLiked(likedBags.includes(id));
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => setHasShadow(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLike = async () => {
    if (!id) return;

    const likedBags = JSON.parse(localStorage.getItem("likedBags") || "[]");
    const isCurrentlyLiked = likedBags.includes(id);
    const updated = isCurrentlyLiked
      ? likedBags.filter((bagId: string) => bagId !== id)
      : [...likedBags, id];

    localStorage.setItem("likedBags", JSON.stringify(updated));
    setLiked(!isCurrentlyLiked);

    try {
      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/bags/${id}/like`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: isCurrentlyLiked ? "unlike" : "like" }),
      });
    } catch (error) {
      console.error("Failed to update bag likes:", error);
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  if (isLoading) return <LoadingPage />;
  if (error)
    return (
      <p className="text-center text-red-500">
        Failed to load owner and trip details.
      </p>
    );

  return (
    <div className="w-full">
      {/* Fixed Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 bg-white dark:bg-dark-box px-4 md:px-10 py-4 ${
          hasShadow ? "shadow-md" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          {/* Left: Logo */}
          <RouterLink to="/" className="flex items-center gap-3">
  {/* Light mode logo */}
  <img src="/logo-black.png" alt="Logo" width={85} className="block dark:hidden" />
  
  {/* Dark mode logo */}
  <img src="/logo-white.png" alt="Logo" width={85} className="hidden dark:block" />
</RouterLink>

          {/* Right: Like + Auth */}
          <div className="flex items-center gap-5">
            {/* Like Button */}
            <button
              onClick={toggleLike}
              className="p-2 rounded-full hover:bg-primary/10 transition"
              title={liked ? "Unlike" : "Like"}
            >
              {liked ? (
                <HeartOff className="text-red-600 w-5 h-5" />
              ) : (
                <Heart className="text-gray-400 w-5 h-5" />
              )}
            </button>

            {/* Auth Buttons (if no token) */}
            {!token && (
              <>
                <RouterLink
                  to="/login"
                  className="text-sm text-black hover:text-green-600"
                >
                  Login
                </RouterLink>
                <button
                  className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-orange"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container>
        <div className="pt-24 w-full lg:w-4/5 m-auto">
          {/* User Info */}
          <div className="flex flex-col mb-5 bg-transparent dark:bg-transparent">
          <div className="flex items-center gap-6 sm:gap-8 p-6 rounded-lg bg-white dark:bg-dark-box border border-gray-200 dark:border-dark-box">
  {/* Avatar */}
  <div className="relative">
    <img
      src={data?.user.imageUrl || "/default-profile-placeholder.png"}
      alt={data?.user.username}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
    />
    <div className="absolute bottom-0 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-dark-box" title="Online"></div>
  </div>

  {/* User Details */}
  <div className="space-y-3">
    {/* Username */}
    <div>
      <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-0.5">
       Packed By
      </p>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
        {data?.user.username}
      </h2>
    </div>

    {/* Country */}
    <div>
      <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-0.5">
        Country
      </p>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {data?.user.country}
      </p>
    </div>
  </div>
</div>


 <div className="flex items-start mt-5 rounded-lg p-6 bg-white dark:bg-dark-box border border-gray-200 dark:border-dark-box">
  <div className="w-full space-y-6">
    {/* Trip Title */}
    <div>
      <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
        Trip Title
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
        {data?.trip.name}
      </h2>
    </div>

    {/* Trip Description */}
    {data?.trip.about && (
      <div>
        <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
          Trip Description
        </p>
        <p className="text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
          {data?.trip.about}
        </p>
      </div>
    )}

    {/* Trip Dates */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-4 rounded-lg border border-gray-200 dark:border-dark-box bg-gray-50 dark:bg-primary/20">
        <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
          Start Date
        </p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {formatDate(data?.trip?.startDate)}
        </p>
      </div>
      <div className="p-4 rounded-lg border border-gray-200 dark:border-dark-box bg-gray-50 dark:bg-primary/20">
        <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
          End Date
        </p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {formatDate(data?.trip?.endDate)}
        </p>
      </div>
    </div>
  </div>
</div>
          </div>

          <BagDetails />
        </div>
      </Container>
    </div>
  );
};

export default ShareMain;
