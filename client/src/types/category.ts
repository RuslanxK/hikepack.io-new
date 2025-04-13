import {Item as ItemData} from "./item"

export interface Category {
    _id: string; 
    tripId?: string;
    bagId?: string;
    name?: string;
    order?: number | null; 
    color?: string; 
    owner?: string; 
    totalWeight?: string;
    wornWeight?: string;
    items?: ItemData[];
  }
  
  export interface Item {
    id: number;
    name: string;
    description: string;
    qty: number;
    weight: number;
    weightUnit: 'kg' | 'g' | 'lb' | 'oz';
    priority: 'Low' | 'Medium' | 'High';
    isChecked: boolean;
  }
  
  export interface DataTableProps {
    data: Category;
   
  }