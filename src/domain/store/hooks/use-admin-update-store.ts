import { Response } from '@medusajs/medusa-js';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import client from '../../../services/api';
import { queryKeys } from '../../../utils/query-keys';

type AdminUpdateStore = {
  is_trusted: boolean;
};

export const useAdminUpdateStore = (
  id: string,
  options?: UseMutationOptions<Response<void>, Error, AdminUpdateStore>,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: AdminUpdateStore) => {
      const response = await client.store.updateById(id, payload);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.adminUsers]);
      },
      ...options,
    },
  );
};
