import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Discount, DiscountCondition } from '@medusajs/medusa'
import { capitalize } from 'lodash'

import Button from '../../../../../components/fundamentals/button'
import Modal from '../../../../../components/molecules/modal'
import LayeredModal, {
  LayeredModalContext,
} from '../../../../../components/molecules/modal/layered-modal'
import { getTitle } from '../../../utils'

import ProductCollectionsConditionsTable from './add-condition-resources/collections/collections-conditions-table'
import CustomerGroupsConditionsTable from './add-condition-resources/customer-groups/customer-groups-conditions-table'
import ProductTypesConditionsTable from './add-condition-resources/product-types/type-conditions-table'
import ProductConditionsTable from './add-condition-resources/products/product-conditions-table'
import ProductTagsConditionsTable from './add-condition-resources/tags/tags-conditions-table'
import { EditConditionProvider } from './edit-condition-provider'

type Props = {
  open: boolean
  condition: DiscountCondition
  discount: Discount
  onClose: () => void
}

const EditConditionsModal = ({ open, condition, discount, onClose }: Props) => {
  const { t } = useTranslation()
  const context = useContext(LayeredModalContext)

  const renderModalContext = () => {
    switch (condition.type) {
      case 'products':
        return <ProductConditionsTable />
      case 'product_collections':
        return <ProductCollectionsConditionsTable />
      case 'product_types':
        return <ProductTypesConditionsTable />
      case 'product_tags':
        return <ProductTagsConditionsTable />
      case 'customer_groups':
        return <CustomerGroupsConditionsTable />
    }
  }

  return (
    <EditConditionProvider
      condition={condition}
      discount={discount}
      onClose={onClose}
    >
      <LayeredModal open={open} handleClose={onClose} context={context}>
        <Modal.Body>
          <Modal.Header handleClose={onClose}>
            <h1 className="inter-xlarge-semibold">
              {t(
                'edit-condition-title',
                'Edit {{type}} in Discount Condition',
                {
                  type: capitalize(getTitle(condition?.type, t)),
                }
              )}
            </h1>
          </Modal.Header>
          {renderModalContext()}
          <Modal.Footer>
            <div className="flex w-full items-center justify-end">
              <Button
                variant="primary"
                size="small"
                type="button"
                onClick={onClose}
              >
                {t('edit-condition-close', 'Close')}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </LayeredModal>
    </EditConditionProvider>
  )
}

export default EditConditionsModal
