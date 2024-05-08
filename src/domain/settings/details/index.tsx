import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import BackButton from '../../../components/atoms/back-button';
import Switch from '../../../components/atoms/switch';
import BodyCard from '../../../components/organisms/body-card';
import useNotification from '../../../hooks/use-notification';
import { getErrorMessage } from '../../../utils/error-messages';

import { Settings, useAdminSettings } from './use-admin-settings';
import { useAdminUpdateSettings } from './use-admin-update-settings';

type SettingsDetailsFormData = {
  site_wide_verification: boolean;
};

const AccountDetails = () => {
  const { control, reset, handleSubmit } = useForm<SettingsDetailsFormData>();
  const { settings } = useAdminSettings();
  const { mutate } = useAdminUpdateSettings();
  const notification = useNotification();
  const { t } = useTranslation();

  const handleCancel = () => {
    if (settings) {
      reset(mapStoreDetails(settings));
    }
  };

  useEffect(() => {
    handleCancel();
  }, [settings]);

  const onSubmit = (data: SettingsDetailsFormData) => {
    mutate(data, {
      onSuccess: () => {
        notification(
          t('settings-success', 'Success'),
          t(
            'settings-successfully-updated-store',
            'Successfully updated store',
          ),
          'success',
        );
      },
      onError: error => {
        notification(
          t('settings-error', 'Error'),
          getErrorMessage(error),
          'error',
        );
      },
    });
  };

  return (
    <form className="flex-col py-5">
      <div className="max-w-[632px]">
        <BackButton
          path="/a/settings/"
          label={t('settings-back-to-settings', 'Back to Settings')}
          className="mb-xsmall"
        />
        <BodyCard
          className="min-h-[300px]"
          events={[
            {
              label: t('settings-save', 'Save'),
              type: 'button',
              onClick: handleSubmit(onSubmit),
            },
            {
              label: t('settings-cancel', 'Cancel'),
              type: 'button',
              onClick: handleCancel,
            },
          ]}
          title={'App details'}
          subtitle={'Manage your app details'}
        >
          <div className="gap-y-xlarge  flex flex-col">
            <div>
              <h3 className="inter-small-semibold text-grey-50 flex w-full items-center mb-xsmall">
                General
              </h3>
              <div className="mb-2xsmall flex items-center justify-between">
                <h2 className="inter-base-semibold">Site wide verification</h2>
                <Controller
                  control={control}
                  name={'site_wide_verification'}
                  render={({ field: { value, onChange } }) => {
                    return (
                      <Switch checked={value} onCheckedChange={onChange} />
                    );
                  }}
                />
              </div>
              <p className="inter-base-regular text-grey-50">
                When checked verification process will be skipped for all
                products
              </p>
            </div>
          </div>
        </BodyCard>
      </div>
    </form>
  );
};

const mapStoreDetails = (settings: Settings): SettingsDetailsFormData => {
  return {
    site_wide_verification: settings.site_wide_verification,
  };
};

export default AccountDetails;
