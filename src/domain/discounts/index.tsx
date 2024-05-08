import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

import Fade from '../../components/atoms/fade-wrapper';
import Spacer from '../../components/atoms/spacer';
import PlusIcon from '../../components/fundamentals/icons/plus-icon';
import BodyCard from '../../components/organisms/body-card';
import TableViewHeader from '../../components/organisms/custom-table-header';
import DiscountTable from '../../components/templates/discount-table';

import DiscountForm from './new/discount-form';
import { DiscountFormProvider } from './new/discount-form/form/discount-form-context';
import Details from './details';
import New from './new';

const DiscountIndex = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const actionables = [
    {
      label: t('discounts-add-discount', 'Add Discount'),
      onClick: () => setIsOpen(true),
      icon: <PlusIcon size={20} />,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="gap-y-xsmall flex w-full grow flex-col">
        <BodyCard actionables={actionables} customHeader={<TableViewHeader views={['discounts']} />} className="h-fit">
          <DiscountTable />
        </BodyCard>

        <Spacer />
      </div>
      <DiscountFormProvider>
        <Fade isVisible={isOpen} isFullScreen={true}>
          <DiscountForm closeForm={() => setIsOpen(false)} />
        </Fade>
      </DiscountFormProvider>
    </div>
  );
};

const Discounts = () => {
  return (
    <Routes>
      <Route index element={<DiscountIndex />} />
      <Route path="/new" element={<New />} />
      <Route path="/:id" element={<Details />} />
    </Routes>
  );
};

export default Discounts;
