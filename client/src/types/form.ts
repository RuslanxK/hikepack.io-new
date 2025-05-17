export interface FormData {
    email?: string;
    username?: string;
    password?: string;
    repeatPassword?: string
    country?: string
    birthdate?: string
    gender?: string
    distanceUnit?: string
    weightUnit?: string
    activityLevel?: string
    imageUrl?: File | null;
    hasCompletedProfile?: boolean
  }


  export interface DatePickerProps {
    onSelect: (date: Date | undefined) => void;
  }
  