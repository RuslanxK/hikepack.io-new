import { BagItem } from "./bag";
import { LatestBagItem } from "./bag";

export interface AddTripSheetProps {

    isOpen: boolean;
    onClose: (open: boolean) => void;
    onSubmit: (data: TripFormData) => void;
    isLoading: boolean
    isError: string
  }


  export interface TripResponse {
    data: TripItem[];
    total: number;
    latestBag?: LatestBagItem; 
  }



  export interface TripFormData {
    name: string;
    country: string;
    about: string;
    startDate:Date;
    endDate: Date;
    distance: string,
    imageUrl?: File | null;
   
  }

  export interface TripItem {
    _id?: string;
    name: string;
    country: string;
    about: string;
    startDate: Date;
    endDate: Date;
    distance: string;
    imageUrl?: File | null;
    bags: BagItem[];
    totalBags: number;
    page: number;
    limit: number;
    latestBag?: LatestBagItem; 

  }

  export interface TripProps {
    data: {
      _id?: string;
      name: string;
      about: string;
      startDate:Date,
      endDate: Date,
      imageUrl?:File | null;
    };

    isLoading?: boolean
  }

  export interface TripComponentProps extends TripProps {
    onDelete: () => void;
    duplicate: () => void;
  }
  

  export interface EditTripSheetProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    onSubmit: (data: TripFormData) => void;
    data?: TripItem;
    errorMessage: string
    isUpdating: boolean
  }