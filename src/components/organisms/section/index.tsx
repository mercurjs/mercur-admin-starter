import React from 'react'
import clsx from 'clsx'

import Actionables, { ActionType } from '../../molecules/actionables'

type SectionProps = {
  children?: React.ReactNode
  title?: string
  actions?: ActionType[]
  customActions?: React.ReactNode
  forceDropdown?: boolean
  status?: React.ReactNode
  className?: string
}

const Section = ({
  title,
  actions,
  customActions,
  forceDropdown = false,
  status,
  children,
  className,
}: SectionProps) => {
  const hasHeader = title || actions || customActions || status

  return (
    <div
      className={clsx(
        'px-xlarge pt-large pb-xlarge rounded-rounded bg-grey-0 border-grey-20 border',
        className
      )}
    >
      {hasHeader && (
        <div className="flex flex-wrap gap-base items-center justify-between mb-base">
          {title && (
            <h1 className="text-grey-90 inter-xlarge-semibold">{title}</h1>
          )}
          <div className="flex items-center gap-x-2">
            {customActions && customActions}
            {status && status}
            {actions && (
              <Actionables actions={actions} forceDropdown={forceDropdown} />
            )}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

export default Section
