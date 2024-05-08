import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@medusajs/icons';
import { ProductTag } from '@medusajs/medusa';

import NestedMultiselect from '../../../domain/categories/components/multiselect';
import useNotification from '../../../hooks/use-notification';
import useProductCategoriesOptions from '../../../hooks/use-product-categories-options';
import { getErrorMessage } from '../../../utils/error-messages';
import Button from '../../fundamentals/button';
import InputHeader from '../../fundamentals/input-header';
import InputField from '../../molecules/input';
import Modal from '../../molecules/modal';

import { useAdminCreateProductTag } from './use-admin-create-product-tag';
import { useAdminUpdateProductTag } from './use-admin-update-product-tag';

type ProductTagModalProps = {
  onClose: () => void;
  isEdit?: boolean;
  tag: ProductTag | null;
};

type ProductTagModalFormData = {
  value: string;
  category_id: string[];
};

const ProductTagModal: React.FC<ProductTagModalProps> = ({
  onClose,
  isEdit = false,
  tag,
}) => {
  const categoriesOptions = useProductCategoriesOptions();
  const { t } = useTranslation();
  const { mutate: update, isLoading: updating } = useAdminUpdateProductTag(
    tag?.id!,
  );
  const { mutate: create, isLoading: creating } = useAdminCreateProductTag();

  const form = useForm<ProductTagModalFormData>({
    defaultValues: {
      value: tag?.value ?? '',
      category_id: tag?.categories.map(c => c.id) ?? [],
    },
  });
  const { register, handleSubmit, reset } = form;

  useEffect(() => {
    if (tag) {
      reset({
        value: tag.value,
        category_id: tag?.categories.map(c => c.id) ?? [],
      });
    }
  }, [tag, reset]);

  const notification = useNotification();

  const submit = (data: ProductTagModalFormData) => {
    if (isEdit) {
      update(data, {
        onSuccess: () => {
          notification(
            t('collection-modal-success', 'Success'),
            'Successfully updated tag',
            'success',
          );
          onClose();
        },
        onError: error => {
          notification(
            t('collection-modal-error', 'Error'),
            getErrorMessage(error),
            'error',
          );
        },
      });
    } else {
      create(data, {
        onSuccess: () => {
          notification(
            t('collection-modal-success', 'Success'),
            'Succesfuly create tag',
            'success',
          );
          onClose();
        },
        onError: error => {
          notification(
            t('collection-modal-error', 'Error'),
            getErrorMessage(error),
            'error',
          );
        },
      });
    }
  };

  return (
    <Modal handleClose={onClose} isLargeModal>
      <Modal.Body>
        <Modal.Header handleClose={onClose}>
          <div>
            <h1 className="inter-xlarge-semibold mb-2xsmall">
              {isEdit ? 'Edit Product Tag' : 'Add new Tag'}
            </h1>
            <p className="inter-small-regular text-grey-50">
              {isEdit
                ? 'To update a new tag, all you need is name'
                : 'To create a tag, all you need is name'}
            </p>
          </div>
        </Modal.Header>
        <form onSubmit={handleSubmit(submit)}>
          <Modal.Content className="min-h-[220px]">
            <div>
              <div className="gap-x-base flex flex-col gap-4">
                <InputField
                  label={'Name'}
                  required
                  placeholder={'GPT-3.5 Turbo'}
                  {...register('value', { required: true })}
                />
                <div>
                  <InputHeader label="Categories" className="mb-2" />
                  {categoriesOptions.length ? (
                    <Controller
                      name={'category_id'}
                      control={form.control}
                      render={({ field: { value, onChange } }) => {
                        const initiallySelected = (value || []).reduce(
                          (acc, val) => {
                            acc[val] = true;
                            return acc;
                          },
                          {} as Record<string, true>,
                        );

                        return (
                          <NestedMultiselect
                            placeholder={
                              categoriesOptions?.length
                                ? 'Choose categories'
                                : 'No categories available'
                            }
                            onSelect={onChange}
                            options={categoriesOptions}
                            initiallySelected={initiallySelected}
                          />
                        );
                      }}
                    />
                  ) : (
                    <div className="flex min-h-[40px] items-center justify-center">
                      <Spinner className="text-ui-fg-subtle animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="gap-x-xsmall flex w-full items-center justify-end">
              <Button
                variant="secondary"
                size="small"
                type="button"
                onClick={onClose}
              >
                {t('collection-modal-cancel', 'Cancel')}
              </Button>
              <Button
                variant="primary"
                size="small"
                loading={isEdit ? updating : creating}
              >
                {isEdit ? 'Update tag' : 'Publish tag'}
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ProductTagModal;
