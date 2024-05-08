import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EllipseGreenSolid,
  EllipseGreySolid,
  EllipseRedSolid,
  EllipsisHorizontal,
  ExclamationCircle,
  Key,
  PencilSquare,
  Spinner,
  Trash,
} from "@medusajs/icons";
import { UserStatus } from "@medusajs/medusa";
import {
  Button,
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  Text,
  usePrompt,
  useToggleState,
} from "@medusajs/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminDeleteUser,
  useAdminSendResetPasswordToken,
  useAdminUpdateUser,
  useAdminUser,
} from "medusa-react";
import moment from "moment";

import useNotification from "../../../../hooks/use-notification";
import { UserRoles } from "../../../../types/api";
import { getErrorMessage } from "../../../../utils/error-messages";
import { queryKeys } from "../../../../utils/query-keys";

import UserDetailsDrawer from "./edit";
import BackButton from "../../../../components/atoms/back-button";
import { useTranslation } from "react-i18next";

const UserEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { user, isLoading, isError } = useAdminUser(id!);
  const { state: drawerState, open, close } = useToggleState();

  if (isLoading) {
    return (
      <Container className="flex min-h-[320px] items-center justify-center">
        <Spinner className="text-ui-fg-subtle animate-spin" />
      </Container>
    );
  }

  if (isError || !user) {
    return (
      <Container className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-x-2">
          <ExclamationCircle className="text-ui-fg-base" />
          <Text className="text-ui-fg-subtle">
            Error occured while loading user. Reload the page and try again. If
            the issue persists, try again later.
          </Text>
        </div>
      </Container>
    );
  }

  const fullName =
    user.first_name || user.last_name
      ? `${user.first_name ?? "-"} ${user.last_name ?? "-"}`
      : null;

  // Vendors have role 'admin'
  const isVendor = user.role === UserRoles.ADMIN;
  const billing_info = user?.metadata?.billing_info as string;

  return (
    <div className="flex flex-col gap-3">
      <BackButton
        path="/a/settings/team"
        label={t("settings-back-to-users", "Back to Users")}
        className="mb-xsmall"
      />
      <Container>
        <div className="flex flex-col gap-y-1 pb-6">
          <div className="flex items-center justify-between">
            <Heading>User Details</Heading>
            <div className="flex items-center gap-x-2">
              <UserStatusMenu status={user.status} userId={user.id} />
              <UserMenu userId={user.id} onOpenDrawer={open} />
            </div>
          </div>
          <Text>{user.email}</Text>
        </div>
        <div className="small:grid-cols-2 medium:grid-cols-3 grid grid-cols-1 gap-6">
          <div className="border-ui-border-base flex flex-col gap-y-1 border-l px-4">
            <Text size="base" className="text-ui-fg-subtle">
              First and last name
            </Text>
            {fullName ? (
              <Text size="large">{fullName}</Text>
            ) : (
              <Text size="large" className="text-ui-fg-muted">
                -
              </Text>
            )}
          </div>
          <div className="border-ui-border-base flex flex-col gap-y-1 border-l px-4">
            <Text size="base" className="text-ui-fg-subtle">
              Created at
            </Text>
            <Text size="large">
              {moment(user.created_at).format("MMM Do YYYY [at] HH:mm a")}
            </Text>
          </div>
          <div className="border-ui-border-base flex flex-col gap-y-1 border-l px-4">
            <Text size="base" className="text-ui-fg-subtle">
              Role
            </Text>
            <Text size="large">{user.role}</Text>
          </div>
          {billing_info && isVendor && (
            <div className="border-ui-border-base flex flex-col gap-y-1 border-l px-4">
              <Text size="base" className="text-ui-fg-subtle">
                Billing Info
              </Text>
              {billing_info.split(",").map((info, index) => (
                <Text key={index} size="large">
                  {info}
                </Text>
              ))}
            </div>
          )}
        </div>
      </Container>
      <UserDetailsDrawer onOpenChange={close} open={drawerState} user={user} />
    </div>
  );
};

const statusOptions: {
  value: UserStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "active", label: "Active", icon: <EllipseGreenSolid /> },
  { value: "pending", label: "Pending", icon: <EllipseGreySolid /> },
  { value: "rejected", label: "Rejected", icon: <EllipseRedSolid /> },
];

type UserStatusMenuProps = {
  status: UserStatus;
  userId: string;
};

const UserStatusMenu = ({ status, userId }: UserStatusMenuProps) => {
  const notification = useNotification();

  const { mutateAsync } = useAdminUpdateUser(userId);

  const onUpdateStatus = async (newStatus: UserStatus) => {
    mutateAsync(
      { status: newStatus },
      {
        onSuccess: () => {
          notification("Success", "Succesfully updated user status", "success");
        },
        onError: (err) => {
          notification(
            "Failed to update user status",
            getErrorMessage(err),
            "error"
          );
        },
      }
    );
  };

  const currentOption = useMemo(
    () => statusOptions.find((s) => s.value === status)!,
    [status]
  );

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          className="!text-ui-fg-base flex items-center !gap-x-1.5 pl-2.5 pr-3 capitalize"
        >
          {currentOption.icon}
          {currentOption.label}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" side="bottom" className="min-w-[200px]">
        {statusOptions.map(({ value, label, icon }) => (
          <DropdownMenu.Item key={value} onClick={() => onUpdateStatus(value)}>
            {icon}
            {label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

type UserMenuProps = {
  userId: string;
  onOpenDrawer: () => void;
};

const UserMenu = ({ userId, onOpenDrawer }: UserMenuProps) => {
  const prompt = usePrompt();
  const notification = useNotification();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const requestPasswordReset = useAdminSendResetPasswordToken();
  const { user, isLoading } = useAdminUser(userId!);

  if (isLoading || !user) {
    return null;
  }

  const { mutate } = useAdminDeleteUser(userId, {
    onSuccess: () => {
      notification("Success", "Succesfully deleted user", "success");
      queryClient.invalidateQueries([queryKeys.adminUsers]);
      navigate("/a/settings/team");
    },
    onError: (err) => {
      notification("Failed to delete user", getErrorMessage(err), "error");
    },
  });

  const onDelete = async () => {
    const res = await prompt({
      title: "Delete user",
      description: "Are you sure you want to delete this user?",
    });

    if (!res) {
      return;
    }

    mutate();
  };

  const onPasswordReset = async () => {
    const res = await prompt({
      title: "Password reset",
      description: "Are you sure you want to reset password for this user?",
    });

    if (!res) {
      return;
    }

    const email = user.email;

    requestPasswordReset.mutate(
      {
        email,
      },
      {
        onSuccess: () => {
          notification("Success", "Succesfully reset password", "success");
        },
        onError: (err) => {
          notification(
            "Failed to reset password",
            getErrorMessage(err),
            "error"
          );
        },
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton>
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" side="bottom">
        <DropdownMenu.Item onClick={onOpenDrawer}>
          <PencilSquare className="text-ui-fg-subtle" />
          <span className="ml-2">Edit details</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={onPasswordReset}>
          <Key className="text-ui-fg-subtle" />
          <span className="ml-2">Password reset</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={onDelete}>
          <Trash className="text-ui-fg-subtle" />
          <span className="ml-2">Delete</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export default UserEdit;
