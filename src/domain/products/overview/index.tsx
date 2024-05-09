import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDownMini } from "@medusajs/icons";
import { useAdminCreateBatchJob, useAdminCreateCollection } from "medusa-react";

import Spacer from "../../../components/atoms/spacer";
import Button from "../../../components/fundamentals/button";
import ExportIcon from "../../../components/fundamentals/icons/export-icon";
import PlusIcon from "../../../components/fundamentals/icons/plus-icon";
import UploadIcon from "../../../components/fundamentals/icons/upload-icon";
import Actionables from "../../../components/molecules/actionables";
import BodyCard from "../../../components/organisms/body-card";
import TableViewHeader from "../../../components/organisms/custom-table-header";
import ExportModal from "../../../components/organisms/export-modal";
import AddCollectionModal from "../../../components/templates/collection-modal";
import CollectionsTable from "../../../components/templates/collections-table";
import ProductTable from "../../../components/templates/product-table";
import useNotification from "../../../hooks/use-notification";
import useToggleState from "../../../hooks/use-toggle-state";
import { usePolling } from "../../../providers/polling-provider";
import { getErrorMessage } from "../../../utils/error-messages";
import ImportProducts from "../batch-job/import";

import { useProductTableActions } from "./actions";

type View = "products" | "collections";

const VIEWS: View[] = ["products", "collections"];

const Overview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<View>("products");
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  const actionables = useProductTableActions({ productIds: bulkSelectedIds });

  const { resetInterval } = usePolling();
  const createBatchJob = useAdminCreateBatchJob();

  const notification = useNotification();

  const createCollection = useAdminCreateCollection();

  useEffect(() => {
    if (location.search.includes("?view=collections")) {
      setView("collections");
    }
  }, [location]);

  useEffect(() => {
    location.search = "";
  }, [view]);

  const onBulkSelectionChange = useCallback((selectedIds: string[]) => {
    setBulkSelectedIds(selectedIds);
  }, []);

  const CurrentView = useCallback(() => {
    switch (view) {
      case "products":
        return <ProductTable onBulkSelectionChange={onBulkSelectionChange} />;
      default:
        return <CollectionsTable />;
    }
  }, [view]);

  const CurrentAction = () => {
    switch (view) {
      case "products":
        return (
          <div className="flex space-x-2">
            {!!bulkSelectedIds.length && (
              <Actionables
                customTrigger={
                  <Button variant="primary" size="small">
                    <ChevronDownMini />
                    <span>
                      Bulk actions <span>({bulkSelectedIds.length})</span>
                    </span>
                  </Button>
                }
                actions={actionables}
              />
            )}
            <Button
              variant="secondary"
              size="small"
              onClick={() => openImportModal()}
            >
              <UploadIcon size={20} className="hidden small:block" />
              {t("overview-import-products", "Import Products")}
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => openExportModal()}
            >
              <ExportIcon size={20} className="hidden small:block" />
              {t("overview-export-products", "Export Products")}
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowNewCollection(!showNewCollection)}
            >
              <PlusIcon size={20} />
              {t("overview-new-collection", "New Collection")}
            </Button>
          </div>
        );
    }
  };

  const [showNewCollection, setShowNewCollection] = useState(false);
  const {
    open: openExportModal,
    close: closeExportModal,
    state: exportModalOpen,
  } = useToggleState(
    !location.search.includes("view=collections") &&
      location.search.includes("modal=export")
  );

  const {
    open: openImportModal,
    close: closeImportModal,
    state: importModalOpen,
  } = useToggleState(
    !location.search.includes("view=collections") &&
      location.search.includes("modal=import")
  );

  const handleCreateCollection = async (data, colMetadata) => {
    const metadata = colMetadata
      .filter((m) => m.key && m.value) // remove empty metadata
      .reduce((acc, next) => {
        return {
          ...acc,
          [next.key]: next.value,
        };
      }, {});

    await createCollection.mutateAsync(
      { ...data, metadata },
      {
        onSuccess: ({ collection }) => {
          notification(
            t("overview-success", "Success"),
            t(
              "overview-successfully-created-collection",
              "Successfully created collection"
            ),
            "success"
          );
          navigate(`/a/collections/${collection.id}`);
          setShowNewCollection(false);
        },
        onError: (err) =>
          notification(
            t("overview-error", "Error"),
            getErrorMessage(err),
            "error"
          ),
      }
    );
  };

  const handleCreateExport = () => {
    const reqObj = {
      type: "product-export",
      context: {},
      dry_run: false,
    };

    createBatchJob.mutate(reqObj, {
      onSuccess: () => {
        resetInterval();
        notification(
          t("overview-success", "Success"),
          t(
            "overview-successfully-initiated-export",
            "Successfully initiated export"
          ),
          "success"
        );
      },
      onError: (err) => {
        notification(
          t("overview-error", "Error"),
          getErrorMessage(err),
          "error"
        );
      },
    });

    closeExportModal();
  };

  return (
    <>
      <div className="gap-y-xsmall flex h-full grow flex-col">
        <div className="flex w-full grow flex-col">
          <BodyCard
            forceDropdown={false}
            customActionable={CurrentAction()}
            customHeader={
              <TableViewHeader
                views={VIEWS}
                setActiveView={setView}
                activeView={view}
              />
            }
            className="h-fit"
          >
            <CurrentView />
          </BodyCard>
          <Spacer />
        </div>
      </div>
      {showNewCollection && (
        <AddCollectionModal
          onClose={() => setShowNewCollection(!showNewCollection)}
          onSubmit={handleCreateCollection}
        />
      )}
      {exportModalOpen && (
        <ExportModal
          title="Export Products"
          handleClose={() => closeExportModal()}
          onSubmit={handleCreateExport}
          loading={createBatchJob.isLoading}
        />
      )}
      {importModalOpen && (
        <ImportProducts handleClose={() => closeImportModal()} />
      )}
    </>
  );
};

export default Overview;
