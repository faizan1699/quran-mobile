import { useQuery } from '@tanstack/react-query';
import { popupsService } from '@/services/popupsService';
import { Popup } from '@shared-types';

export function usePopups(): { popups: Popup[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['popups', 'active'],
    queryFn: () => popupsService.getPopups(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    popups: query.data ?? [],
    isLoading: query.isLoading,
  };
}
