import { LineItem, ShippingMethod } from "@medusajs/medusa";
import { ReservationItemDTO } from "@medusajs/types";

import ImagePlaceholder from "../../../../components/fundamentals/image-placeholder";
import { useFeatureFlag } from "../../../../providers/feature-flag-provider";
import { formatAmountWithSymbol } from "../../../../utils/prices";
import ReservationIndicator from "../../components/reservation-indicator/reservation-indicator";
import { useNavigate } from "react-router-dom";

type OrderLineProps = {
  item: LineItem;
  currencyCode: string;
  reservations?: ReservationItemDTO[];
  isAllocatable?: boolean;
  shippingMethods?: ShippingMethod[];
};

const OrderLine = ({
  item,
  currencyCode,
  reservations,
  isAllocatable = true,
  shippingMethods,
}: OrderLineProps) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`/a/products/${item.variant.product.id}`);
  };

  const shippingPrice =
    shippingMethods &&
    shippingMethods.length > 0 &&
    shippingMethods?.find((el) => el.data.line_item_id === item.id)?.price;

  return (
    <div
      className="hover:bg-grey-5 rounded-rounded mx-[-5px] mb-1 flex min-h-[64px] justify-between py-2 px-[5px] cursor-pointer"
      onClick={handleRedirect}
    >
      <div>
        <p className="text-small text-ui-fg-subtle py-2 pl-0.5">
          Seller: <span>{item.variant.product.store.name}</span>
        </p>
        <div className="flex justify-center space-x-4">
          <div className="rounded-rounded flex h-[48px] w-[36px] overflow-hidden">
            {item.thumbnail ? (
              <img src={item.thumbnail} className="object-cover" />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
          <div className="flex max-w-[185px] flex-col justify-center">
            <span className="inter-small-regular text-grey-90 truncate">
              {item.title}
            </span>
            {item?.variant && (
              <span className="inter-small-regular text-grey-50 truncate">
                {`${item.variant.title}${
                  item.variant.sku ? ` (${item.variant.sku})` : ""
                }`}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="small:space-x-2 medium:space-x-4 large:space-x-6 mr-3 flex">
          <div className="inter-small-regular text-grey-50">
            {formatAmountWithSymbol({
              amount: (item?.total ?? 0) / item.quantity,
              currency: currencyCode,
              digits: 2,
              tax: [],
            })}
          </div>
          <div className="inter-small-regular text-grey-50">
            x {item.quantity}
          </div>
          {isFeatureEnabled("inventoryService") && isAllocatable && (
            <ReservationIndicator reservations={reservations} lineItem={item} />
          )}
          <div className="inter-small-regular text-grey-90 min-w-[55px] text-right">
            {formatAmountWithSymbol({
              amount: item.total ?? 0,
              currency: currencyCode,
              digits: 2,
              tax: [],
            })}{" "}
            {shippingPrice &&
              `(Delivery
            ${formatAmountWithSymbol({
              amount: shippingPrice!,
              currency: currencyCode,
              digits: 2,
              tax: [],
            })})`}
          </div>
        </div>
        <div className="inter-small-regular text-grey-50">
          {currencyCode.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default OrderLine;
