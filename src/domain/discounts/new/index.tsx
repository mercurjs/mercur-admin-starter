import { DiscountFormProvider } from './discount-form/form/discount-form-context'
import DiscountForm from './discount-form'

const New = () => {
  return (
    <div className="pb-xlarge">
      <DiscountFormProvider>
        <DiscountForm />
      </DiscountFormProvider>
    </div>
  )
}

export default New
