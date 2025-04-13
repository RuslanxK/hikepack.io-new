import { useQuery } from '@tanstack/react-query';
import { apiService, countriesApi } from '@/lib/apiService';

interface Country {
  name: {
    common: string;
  };
}

const fetchCountries = async (): Promise<string[]> => {
  const data = await apiService.get<Country[]>(countriesApi);

return data.filter((country) => country.name.common !== 'Palestine').sort((a, b) => a.name.common.localeCompare(b.name.common)).map((country) => country.name.common)};

const useCountries = () => {
  const { data: countryNameArr = [], isLoading, isError } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 60 * 60 * 1000, 
  });

  return { countryNameArr, isLoading, isError };
};

export default useCountries;
