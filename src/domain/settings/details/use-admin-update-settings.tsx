import { Response } from '@medusajs/medusa-js';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import client from '../../../services/api';
import { queryKeys } from '../../../utils/query-keys';

type AdminSettingsUpdateReq = {
  site_wide_verification: boolean;
};

export const useAdminUpdateSettings = (
  options?: UseMutationOptions<Response<void>, Error, AdminSettingsUpdateReq>,
) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (payload: AdminSettingsUpdateReq) => {
      const response = await client.settings.update(payload);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.settings]);
      },
      ...options,
    },
  );
};
