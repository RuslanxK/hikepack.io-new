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
        className={`fixed top-0 left-0 w-full z-50 bg-white px-4 md:px-10 py-4 ${
          hasShadow ? "shadow-md" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          {/* Left: Logo */}
          <RouterLink to="/" className="flex items-center gap-3">
            <img src="/logo-black.png" alt="Logo" width={85} />
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
                <HeartOff className="text-primary w-5 h-5" />
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
            <div className="flex items-center bg-white dark:bg-dark-box rounded-lg gap-4 p-6">
              <img
                src={data?.user.imageUrl || "/default-profile-placeholder.png"}
                alt={data?.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {data?.user.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {data?.user.country}
                </p>
              </div>
            </div>

            {/* Trip Info */}
            <div className="flex items-start mt-5 rounded-lg p-6 bg-white dark:bg-dark-box">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {data?.trip.name}
                </h2>
                {data?.trip.about && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {data?.trip.about}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(data?.trip?.startDate)} →{" "}
                  {formatDate(data?.trip?.endDate)}
                </p>
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
