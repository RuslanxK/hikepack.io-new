import React, { useState, useCallback, useEffect, Fragment } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Grid from '../../components/ui/grid';
import Trip from '../trips/trip';
import AddButton from '../../components/ui/add-button';
import AddTripSheet from '../sheets/add-trip';
import { apiService } from '../../lib/apiService';
import { TripItem, TripFormData } from '@/types/trip';
import ReusablePagination from '@/components/ui/reusable-ragination';
import DeleteAlert from '../ui/delete-alert';
import { useSearch } from '@/context/search-context';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../loader';
import { Input } from '../ui/input';
import { useUser } from '@/context/user-context';
import { Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { fetchTrips } from '@/lib/api';
import LastBagStatus from '../home/latest-bag';
import { TripResponse } from '@/types/trip';
import { useJoyride } from '../../hooks/useJoyride';
import JoyrideWrapper from '../../components/guide/JoyrideWrapper';
import { homeStepsConfig } from '../guide/stepsConfig';
import { getSteps } from '../guide/steps';


const TripPage: React.FC = () => {

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [errorCreatingMessage, setErrorCreatingMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tripSearchTerm, setTripSearchTerm } = useSearch();
  const { user } = useUser();
  const { toast } = useToast()

  const shouldRunGuide = useJoyride('home-guide');


  const handleDeleteClick = useCallback((trip: TripItem) => {
    setSelectedTrip(trip);
    setShowDeleteAlert(true);
  }, []);


  const { data: tripData, isLoading, isError } = useQuery<TripResponse>({
    queryKey: ['trips', currentPage, tripSearchTerm],
    queryFn: () => fetchTrips(currentPage, itemsPerPage, tripSearchTerm),
    placeholderData: (previousData) => previousData,
  });


    const totalItems = tripData?.total || 0;
    const paginatedTrips = tripData?.data || [];
    const latestBag = tripData?.latestBag

    useEffect(() => {
      setCurrentPage(1); 
    }, [tripSearchTerm]);
  


  const addTripMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiService.post('/trips', data, { headers: { 'Content-Type': 'multipart/form-data' }}),
    onSuccess: () => {
    setErrorCreatingMessage(null);
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    setIsSheetOpen(false);
    },
    onError: (error) => {
      console.error('Failed to add trip:', error);
    setErrorCreatingMessage(error?.message);
    },
  });

  const duplicateTripMutation = useMutation({
    mutationFn: (trip: TripItem) =>
      apiService.post(`/trips/duplicate`, trip),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
    onError: (error) => {
      console.error('Failed to duplicate trip:', error);
      toast({
        title: "Error",
        variant: "destructive",
        description: `${error?.message}`,
      });
    },
  });
  
  

  const deleteTripMutation = useMutation({
    mutationFn: (tripId: string) => apiService.delete(`/trips/${tripId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trips', currentPage, tripSearchTerm] });
  
      const updatedData = queryClient.getQueryData<{ data: TripItem[]; total: number }>(['trips', currentPage, tripSearchTerm]);
      if (!updatedData?.data.length && currentPage > 1) {
        setCurrentPage(1);
      } else if (updatedData?.data.length === 0) {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
      }
      setShowDeleteAlert(false);
      setSelectedTrip(null);
    },
    onError: (error) => {
      console.error('Failed to delete trip:', error);
      toast({
        title: "Error",
        variant: "destructive",
        description: `${error?.message}`,
      });
    },
  });


  const isAdding = addTripMutation.status === "pending"
  const isDeleting = deleteTripMutation.status === "pending"


  const handleDuplicate = useCallback((trip: TripItem) => {
    if (trip._id) {
      duplicateTripMutation.mutate(trip);
    }
  }, [duplicateTripMutation]);

  const confirmDelete = useCallback(() => {
    if (selectedTrip?._id) {
      deleteTripMutation.mutate(selectedTrip._id);
    }
  }, [selectedTrip, deleteTripMutation]);


  const cancelDelete = useCallback(() => {
    setShowDeleteAlert(false);
    setSelectedTrip(null);
  }, []);


  const handleAddTripSubmit = useCallback((data: TripFormData) => {
    const newFormData = new FormData();
    newFormData.append('name', data.name);
    newFormData.append('country', data.country);
    newFormData.append('about', data.about);
    newFormData.append('distance', data.distance);
    if (data.startDate) {
      newFormData.append('startDate', new Date(data.startDate).toISOString());
    }
    if (data.endDate) {
      newFormData.append('endDate', new Date(data.endDate).toISOString());
    }
    if (data.imageUrl) {
      newFormData.append('imageUrl', data.imageUrl);
    }
    addTripMutation.mutate(newFormData);
  }, [addTripMutation]);
  

  const handleSheetClose = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);
    if (!isOpen) {
      setErrorCreatingMessage(null); 
    }
  };


  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  if (isError) {
    console.error('Error fetching trips');
    navigate("/error") 
  }

  if(isLoading) {
    return <LoadingPage />
  }

  return (
    <Fragment>
      <h1 className="text-xl font-bold mb-1">Welcome{' '}{user?.username && user?.username.charAt(0).toUpperCase() + user?.username.slice(1)}</h1>
      <p className="mb-4">The journey of a thousand miles begins with a single step.</p>
      <div className="bg-white p-5 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-4 dark:bg-dark-box mb-5 border">
  <div className="w-full md:w-auto ">
    <h2 className="text-lg font-semibold mb-1">My Last Planned Trips</h2>
    <p className="text-gray-600 dark:text-gray-400">
      Seamless Trip Planning and Bag Organization Made Simple.
    </p>
  </div>

  <div className="relative w-full md:w-1/3">
    <Input
      id="trip-name"
      placeholder="Search an existing trip"
      type="search"
      value={tripSearchTerm}
      onChange={(e) => setTripSearchTerm(e.target.value)}
      className="pl-10 pr-4 py-2 w-full"
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
  </div>
</div>
      <Grid>
        <AddButton onClick={() => setIsSheetOpen(true)} className="add-trip-button" text="Create new trip" />
        {paginatedTrips?.length ? (
          paginatedTrips.map((trip) => (
         <Trip key={trip._id} data={trip} onDelete={() => handleDeleteClick(trip)} duplicate={() => handleDuplicate(trip)}  />
          ))
        ) : (
          <p className="col-span-full text-center">No trips found.</p>
        )}
      </Grid>
      {totalItems > itemsPerPage && (
        <ReusablePagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}/>
      )}
      
      {latestBag ? <LastBagStatus user={user} bag={latestBag} /> : null }
    
      <AddTripSheet isOpen={isSheetOpen} onClose={handleSheetClose} onSubmit={handleAddTripSubmit} isLoading={isAdding} isError={errorCreatingMessage || ''}  />
      <DeleteAlert isOpen={showDeleteAlert} description={`Are you sure you want to delete "${selectedTrip?.name}"? This action cannot be undone.`} onConfirm={confirmDelete} onCancel={cancelDelete} isDeleting={isDeleting} />

      {shouldRunGuide && (
        <JoyrideWrapper steps={getSteps(homeStepsConfig)} run={true} />
      )}
      
    </Fragment>
  );
};

export default TripPage;
