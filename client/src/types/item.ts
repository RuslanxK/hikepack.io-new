export interface Item {
    _id?: string; 
    tripId?: string;
    bagId?: string;
    categoryId?: string;
    name: string;
    qty: number;
    description?: string;
    weightOption?: string | null;
    weight: number;
    priority: 'Low' | 'Medium' | 'High';
    link?: string;
    worn: boolean;
    imageUrl?: string | null;
    order?: number | null;
    owner?: string; 
    createdAt?: string; 
    updatedAt?: string; 
  }
  
