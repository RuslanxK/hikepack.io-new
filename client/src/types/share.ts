 import { TripItem } from "./trip";
 import { User } from "./login";
  
  export interface SharedData {
    trip: TripItem;
    user: User;
  }