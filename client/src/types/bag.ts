export interface BagProps {
  data: BagItem;
  duplicate: () => void;
  onDelete: () => void;
}

export interface AddBagSheetProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSubmit: (data: BagFormData) => void;
  errorMessage: string;
  isAdding: boolean

}

export interface EditBagSheetProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSubmit: (data: BagFormData) => void;
  data?: BagItem;
  errorMessage: string
  isUpdating: boolean
}

export interface BagFormData {
  tripId?: string;
  name: string;
  description: string;
  goal: string;
  exploreBags?: boolean;
  imageUrl?: File | string | null;
}

export interface BagItem {
  _id?: string;
  tripId?: string;
  name?: string;
  description?: string;
  goal?: string;
  passed?: boolean;
  likes?: number;
  exploreBags?: boolean;
  imageUrl?: string;
  owner?: string;
  createdAt?: string; 
  updatedAt?: string; 
}


export interface LatestBagItem {
  _id?: string;
  tripId?: string;
  name?: string;
  description?: string;
  goal?: string;
  passed?: boolean;
  likes?: number;
  exploreBags?: boolean;
  imageUrl?: string;
  owner?: string;
  totalItems: number
  totalCategories: number
  totalBaseWeight: string
  
}
