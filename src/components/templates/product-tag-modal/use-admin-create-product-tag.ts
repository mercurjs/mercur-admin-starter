import { Response } from '@medusajs/medusa-js';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import client from '../../../services/api';
import { queryKeys } from '../../../utils/query-keys';

type AdminCreateProductTagReq = {
  value: string;
};

export const useAdminCreateProductTag = (
  options?: UseMutationOptions<Response<void>, Error, AdminCreateProductTagReq>,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: AdminCreateProductTagReq) => {
      const response = await client.productTags.create(payload);
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
