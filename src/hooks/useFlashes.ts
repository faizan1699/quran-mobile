import { useQuery } from '@tanstack/react-query';
import { flashesService } from '@/services/flashesService';
import { Flash } from '@shared-types';

export function useFlashes(): { flashes: Flash[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['flashes', 'active'],
    queryFn: () => flashesService.getFlashes(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    flashes: query.data ?? [],
    isLoading: query.isLoading,
  };
}
