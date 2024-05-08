import { usePrompt } from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';

import { ActionType } from '../../../components/molecules/actionables';
import useNotification from '../../../hooks/use-notification';
import { getErrorMessage } from '../../../utils/error-messages';
import { queryKeys } from '../../../utils/query-keys';

import { useAdminBulkEditProducts } from './use-admin-bulk-edit-products';

type ProductTableActionsProps = {
  productIds: string[];
};

export const useProductTableActions = ({
  productIds,
}: ProductTableActionsProps): ActionType[] => {
  const dialog = usePrompt();
  const queryClient = useQueryClient();
  const { mutate: bulkUpdate } = useAdminBulkEditProducts({
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.adminProducts]);
    },
  });
  const notification = useNotification();

  const handleReject = async () => {
    const shouldReject = await dialog({
      title: 'Reject products',
      description: 'Are you sure you want to reject products',
    });

    if (shouldReject) {
      bulkUpdate(
        { status: 'rejected', products: productIds },
        {
          onSuccess: () => {
            notification('Success', 'Succesfully rejected products', 'success');
          },
          onError: err => {
            notification('Error', getErrorMessage(err), 'error');
          },
        },
      );
    }
  };

  const handleAccept = async () => {
    const shouldApprove = await dialog({
      title: 'Publish products',
      description: 'Are you sure you want to publish products',
    });

    if (shouldApprove) {
      bulkUpdate(
        { status: 'published', products: productIds },
        {
          onSuccess: () => {
            notification(
              'Success',
              'Succesfully published products',
              'success',
            );
          },
          onError: err => {
            notification('Error', getErrorMessage(err), 'error');
          },
        },
      );
    }
  };

  return [
    { label: 'Publish', onClick: handleAccept },
    { label: 'Reject', onClick: handleReject, variant: 'danger' },
  ];
};
