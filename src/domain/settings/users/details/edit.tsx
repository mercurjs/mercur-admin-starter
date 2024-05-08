import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { User as MedusaUser } from '@medusajs/medusa';
import {
  Button,
  clx,
  Drawer,
  Heading,
  Input,
  Switch,
  Text,
  usePrompt,
} from '@medusajs/ui';
import { useAdminUpdateUser } from 'medusa-react';

import { Form } from '../../../../components/helpers/form';
import useNotification from '../../../../hooks/use-notification';
import { UserRoles } from '../../../../types/api';
import { getErrorMessage } from '../../../../utils/error-messages';
import { useAdminUpdateStore } from '../../../store/hooks/use-admin-update-store';

type User = Omit<MedusaUser, 'password_hash'>;

type UserDetailsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
};

type UserDetailsFormValues = {
  is_trusted: boolean;
  first_name: string;
  last_name: string;
};

const UserDetailsDrawer = ({
  open,
  onOpenChange,
  user,
}: UserDetailsDrawerProps) => {
  const { mutateAsync: updateStoreAsync } = useAdminUpdateStore(user.store_id!);
  const { mutateAsync, isLoading } = useAdminUpdateUser(user.id);
  const { t } = useTranslation();

  const form = useForm<UserDetailsFormValues>({
    defaultValues: getDefaultValues(user),
  });

  const {
    reset,
    formState: { isDirty, dirtyFields },
    handleSubmit,
  } = form;

  React.useEffect(() => {
    if (open) {
      reset(getDefaultValues(user));
    }
  }, [user, open, reset]);

  const prompt = usePrompt();
  const notification = useNotification();

  const onStateChange = React.useCallback(
    async (open: boolean) => {
      if (isDirty) {
        const response = await prompt({
          title: t('price-list-details-drawer-prompt-title', 'Are you sure?'),
          description: t(
            'price-list-details-drawer-prompt-description',
            'You have unsaved changes, are you sure you want to exit?',
          ),
        });

        if (!response) {
          return;
        }
      }

      reset();
      onOpenChange(open);
    },
    [isDirty, t, reset, prompt, onOpenChange],
  );

  const onSubmit = handleSubmit(async ({ is_trusted, ...values }) => {
    if (dirtyFields.is_trusted) {
      await updateStoreAsync(
        { is_trusted },
        {
          onError: err => {
            notification('An error occured', getErrorMessage(err), 'error');
          },
        },
      );
    }

    await mutateAsync(values, {
      onSuccess: () => {
        notification(
          'User updated',
          'User details was successfully updated',
          'success',
        );

        onOpenChange(false);
      },
      onError: err => {
        notification(
          t(
            'price-list-details-drawer-notification-error-title',
            'An error occurred',
          ),
          getErrorMessage(err),
          'error',
        );
      },
    });
  });

  return (
    <Drawer open={open} onOpenChange={onStateChange}>
      <Form {...form}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit user and store details</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <div className="flex flex-col gap-y-8">
              <div>
                <Heading level="h2">
                  {t('price-list-details-form-general-heading', 'General')}
                </Heading>
                <Text className="text-ui-fg-subtle">
                  Edit user details and store permissions
                </Text>
              </div>
              <div className={clx('grid gap-4 grid-cols-1')}>
                <Form.Field
                  control={form.control}
                  name={'first_name'}
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>First name</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="John" />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />
                <Form.Field
                  control={form.control}
                  name={'last_name'}
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>Last name</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="Doe" />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />
                {user.role === UserRoles.VENDOR && (
                  <Form.Field
                    control={form.control}
                    name={'is_trusted'}
                    render={({ field: { onChange, value, ...rest } }) => {
                      return (
                        <Form.Item className="mt-2">
                          <Form.Control>
                            <div className="flex items-center gap-2 justify-between">
                              <Form.Label htmlFor="is_trusted">
                                Trusted store
                              </Form.Label>
                              <Switch
                                id="is_trusted"
                                onCheckedChange={onChange}
                                checked={value}
                                {...rest}
                              />
                            </div>
                          </Form.Control>
                          <p className="inter-base-regular text-grey-50">
                            When checked verification process will be skipped
                          </p>
                          <Form.ErrorMessage />
                        </Form.Item>
                      );
                    }}
                  />
                )}
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">
                {t('price-list-details-drawer-cancel-button', 'Cancel')}
              </Button>
            </Drawer.Close>
            <Button onClick={onSubmit} isLoading={isLoading}>
              {t('price-list-details-drawer-save-button', 'Save')}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Form>
    </Drawer>
  );
};

const getDefaultValues = (user: User): UserDetailsFormValues => {
  return {
    is_trusted: user.is_trusted,
    first_name: user.first_name,
    last_name: user.last_name,
  };
};

export default UserDetailsDrawer;
