import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';
import { useUserStore, FiqhMethod } from '@/store/useUserStore';

const FIQH_VALUES: FiqhMethod[] = ['Hanafi', 'Shafi', 'Maliki', 'Hanbali'];

export function useAdminPrayerSettings(): void {
  const applyAdminPrayerDefaults = useUserStore((s) => s.applyAdminPrayerDefaults);

  const { data } = useQuery({
    queryKey: ['prayer-settings'],
    queryFn: () => settingsService.getPrayerSettings(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    const fiqh = FIQH_VALUES.includes(data.fiqh as FiqhMethod)
      ? (data.fiqh as FiqhMethod)
      : 'Hanafi';
    applyAdminPrayerDefaults({
      fiqh,
      calculationMethod: data.calculationMethod,
      mode: data.mode === 'manual' ? 'manual' : 'auto',
      manualTimes: data.manualTimes,
    });
  }, [data, applyAdminPrayerDefaults]);
}
