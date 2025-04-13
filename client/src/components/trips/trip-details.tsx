import React, { useState, Fragment, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/apiService';
import { ArrowLeft, MapPin, CalendarFold, Edit, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import { differenceInDays, isBefore } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import AddButton from '../../components/ui/add-button';
import Grid from '../ui/grid';
import AddBagSheet from '../sheets/add-bag';
import { BagFormData, BagItem } from '@/types/bag';
import Bag from '../bags/bag';
import EditTripSheet from '../sheets/edit-trip';
import { TripFormData } from '@/types/trip';
import DeleteAlert from '../ui/delete-alert';
import ReusablePagination from '../ui/reusable-ragination';
import { Input } from '../ui/input';
import { useSearch } from '@/context/search-context';
import { useToast } from "@/hooks/use-toast"
import LoadingPage from '../loader';
import { fetchBagsByTripId, fetchTripById } from '@/lib/api';


const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast()
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetEditOpen, setIsSheetEditOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedBag, setSelectedBag] = useState<BagItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addBagError, setAddBagError] = useState<string | null>(null);
  const [editTripError, setEditTripError] = useState<string | null>(null);

  const [itemsPerPage] = useState(7);
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { bagSearchTerm, setBagSearchTerm } = useSearch();
  
  const { data: trip, isLoading: isTripLoading, isError: isTripError } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => fetchTripById(id!),
    enabled: !!id,
  });

  const { data: bagData, isLoading: isBagsLoading, isError: isBagsError } = useQuery({
    queryKey: ['bags', id, currentPage, itemsPerPage, bagSearchTerm],
    queryFn: () => fetchBagsByTripId(id!, currentPage, itemsPerPage, bagSearchTerm),
    enabled: !!id,
  });

  

  const totalItems = bagData?.total || 0;
  const paginatedBags = bagData?.data || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [bagSearchTerm]);


  const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page);
    }, []);


  const addBagMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiService.post('/bags', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bags', id] });
      setAddBagError(null);
      setIsSheetOpen(false);
    },
    onError: (error) => {
      console.error('Failed to add bag:', error);
      setAddBagError(error?.message)
    },
  });


  const handleNavigateBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsSheetEditOpen(true)
  };

  const handleAddBagSubmit = useCallback(
    (data: BagFormData) => {
      if (!id) {
        console.error('Trip ID is undefined');
        return;
      }
      const newFormData = new FormData();
      newFormData.append('tripId', id);
      newFormData.append('name', data.name);
      newFormData.append('description', data.description);
      newFormData.append('goal', data.goal);
      newFormData.append('exploreBags', data.exploreBags ? 'true' : 'false');
      if (data.imageUrl) {
        newFormData.append('imageUrl', data.imageUrl);
      }  
      addBagMutation.mutate(newFormData);
    },
    [id, addBagMutation]
  );


  const startDate = trip?.startDate ? new Date(trip.startDate) : null;
  const today = new Date();
  let tripStatus = 'Unknown';

  if (startDate) {
    if (isBefore(startDate, today)) {
      tripStatus = 'Traveled';
    } else {
      const daysLeft = differenceInDays(startDate, today);
      tripStatus = `${daysLeft} day(s) left`;
    }
  }

  useEffect(() => {
    if (isTripError || isBagsError) {
      console.error('Error fetching trip or bags');
      navigate("/error");
    }
  }, [isTripError, isBagsError, navigate]);


  const handleCloseAddBagSheet = useCallback(() => {
    setIsSheetOpen(false);
    setAddBagError(null);
  }, []);
  
  const handleCloseEditTripSheet = useCallback(() => {
    setIsSheetEditOpen(false);
    setEditTripError(null)
  }, []);
 

  const editTripMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiService.put(`/trips/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      setIsSheetEditOpen(false);
      setEditTripError(null)
      
    },
    onError: (error) => {
      console.error('Failed to edit trip:', error);
      setEditTripError(error?.message)
    },
  });
  
  const handleEditTripSubmit = useCallback(
    (data: TripFormData) => {
      if (!id) {
        console.error('Trip ID is undefined');
        return;
      }
      const updatedFormData = new FormData();
      updatedFormData.append('name', data.name);
      updatedFormData.append('about', data.about);
      updatedFormData.append('distance', data.distance);
  
      if (data.startDate) {
        updatedFormData.append('startDate', new Date(data.startDate).toISOString());
      }
      if (data.endDate) {
        updatedFormData.append('endDate', new Date(data.endDate).toISOString());
      }
      if (data.imageUrl) {
        updatedFormData.append('imageUrl', data.imageUrl);
      }
  
      editTripMutation.mutate(updatedFormData);
    },
    [id, editTripMutation]
  );

  const duplicateBagMutation = useMutation({
      mutationFn: (bag: BagItem) =>
        apiService.post(`/bags/duplicate`, bag),
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bags', id] })},
      onError: (error) => {
        console.error('Failed to duplicate bag:', error);
        toast({
          title: "Error",
          variant: "destructive",
          description: `${error?.message}`,
        });
      },
    });

   const handleDuplicate = useCallback((bag: BagItem) => {
      if (bag._id) {
        duplicateBagMutation.mutate(bag);
      }
    }, [duplicateBagMutation]);
  

     const handleDeleteClick = useCallback((bag: BagItem) => {
        setSelectedBag(bag);
        setShowDeleteAlert(true);

      }, []);

     const cancelDelete = useCallback(() => {
          setShowDeleteAlert(false);
          setSelectedBag(null);
        }, []);

    
        const deleteBagMutation = useMutation({
          mutationFn: (bagId: string) => apiService.delete(`/bags/${bagId}`),
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['bags', id, currentPage, itemsPerPage, bagSearchTerm] });
            const updatedData = queryClient.getQueryData<{ data: BagItem[]; total: number }>(['bags', id, currentPage, itemsPerPage, bagSearchTerm]);
            if (updatedData?.data.length === 0 && currentPage > 1) {
              setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
            }
            setShowDeleteAlert(false);
            setSelectedBag(null);
          },
          onError: (error) => {
            console.error('Failed to delete bag:', error);
            toast({
              title: "Error",
              variant: "destructive",
              description: `${error?.message}`,
            });
          },
        });


      const isAdding = addBagMutation.status === "pending"
      const isDeleting = deleteBagMutation.status === "pending"
      const isUpdating = editTripMutation.status === "pending"

      const confirmDelete = useCallback(() => {
        if (selectedBag?._id) {
           deleteBagMutation.mutate(selectedBag._id);
         }
       }, [selectedBag, deleteBagMutation]);
    

       if(isBagsLoading || isTripLoading) {

           return <LoadingPage />
       }

  return (
    <Fragment>
      <div className="bg-white dark:bg-dark-box p-5 rounded-lg flex justify-between items-center">
      <div className="flex items-center gap-2 w-8/12">
  <Button
    variant="ghost"
    size="icon"
    onClick={handleNavigateBack}
    className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark"
  >
    <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
  </Button>
    <h1 
      className="text-lg font-semibold flex items-center gap-2 ml-2 truncate w-full overflow-hidden text-ellipsis"
      title={trip?.name}>
      {trip?.name}
    </h1>
  
</div>
        <div className="flex h-5 items-center space-x-4 text-sm">
            <Fragment>
              <div className="text-sm flex items-center">
                <MapPin size={18} className="mr-2" /> Distance: {trip?.distance}{' '}
                {user?.distance}
              </div>
              <Separator orientation="vertical" className="dark:bg-gray-500" />
              <div className="text-sm flex items-center">
                <CalendarFold size={18} className="mr-2" /> {tripStatus}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark"
              >
                <Edit className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </Fragment>
          
        </div>
      </div>
      <div className="p-5 bg-white rounded-lg mt-5 mb-5 dark:bg-dark-box">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
           {trip?.about}
          </p>
        

           <div className="relative w-1/3">
            <Input
              id="trip-name"
              placeholder="Search"
              type="search"
              value={bagSearchTerm}
              onChange={(e) => setBagSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2"/>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

      </div>
      <Grid>
        <AddButton onClick={() => setIsSheetOpen(true)} />
        {paginatedBags?.length ? (
          paginatedBags?.map((bag) => <Bag key={bag._id} data={bag} duplicate={() => handleDuplicate(bag)} onDelete={() => handleDeleteClick(bag)} />)
        ) : (
          <p className="col-span-full text-center">No bags found.</p>
        )}
      </Grid>

      {totalItems > itemsPerPage && (
      <ReusablePagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />)}
      <AddBagSheet isOpen={isSheetOpen} onClose={handleCloseAddBagSheet} onSubmit={handleAddBagSubmit} errorMessage={addBagError || ''} isAdding={isAdding} />
      <EditTripSheet isOpen={isSheetEditOpen} onClose={handleCloseEditTripSheet} data={trip} onSubmit={handleEditTripSubmit} errorMessage={editTripError || ""} isUpdating={isUpdating} />
      <DeleteAlert isOpen={showDeleteAlert} description={`Are you sure you want to delete "${selectedBag?.name}"? This action cannot be undone.`} onConfirm={confirmDelete} onCancel={cancelDelete} isDeleting={isDeleting} />

    </Fragment>
  );
};

export default TripDetails;

