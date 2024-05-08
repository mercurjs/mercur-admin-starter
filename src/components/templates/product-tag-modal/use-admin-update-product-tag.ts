import { Response } from '@medusajs/medusa-js';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import client from '../../../services/api';
import { queryKeys } from '../../../utils/query-keys';

type AdminUpdateProductTagReq = {
  value: string;
};

export const useAdminUpdateProductTag = (
  id: string,
  options?: UseMutationOptions<Response<void>, Error, AdminUpdateProductTagReq>,
) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (payload: AdminUpdateProductTagReq) => {
      const response = await client.productTags.update(id, payload);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.adminProductTags]);
      },
      ...options,
    },
  );
};
