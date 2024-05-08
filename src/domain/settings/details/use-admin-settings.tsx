import { useQuery } from '@tanstack/react-query';

import client from '../../../services/api';
import { queryKeys } from '../../../utils/query-keys';

export type Settings = {
  site_wide_verification: boolean;
};

type AdminSettingsResponse = {
  settings: Settings;
};

export const useAdminSettings = () => {
  const { data, ...other } = useQuery([queryKeys.settings], async () => {
    const res = await client.settings.retrieve();
    return res.data as AdminSettingsResponse;
  });

  return { ...data, ...other } as const;
};
