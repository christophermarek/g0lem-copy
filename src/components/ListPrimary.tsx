import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonSecondary } from './buttonSecondary';
import { Frame } from './container';
import React from 'react';
import { OutlineColors } from './HeaderTabs';

interface ListProps {
  listItems:
    | {
        name: string;
        id: string;
        srcImageUrl?: string;
      }[]
    | React.ReactNode;
  itemActions: { exec: (id: string) => Promise<void>; icon: IconDefinition; actionName?: string }[];
  expandedItemIndex?: number;
  children?: React.ReactNode;
  noHoverOutline?: boolean;
  hoverOutlineColor?: string;
  forceButtonsRow?: boolean;
}

export const ListPrimary: React.FC<ListProps> = ({
  listItems,
  itemActions,
  expandedItemIndex,
  children,
  noHoverOutline,
  hoverOutlineColor,
  forceButtonsRow = false,
}) => {
  return (
    <>
      {listItems && (
        <>
          {React.isValidElement(listItems) ? (
            <>
              {listItems}
              <div className='flex text-xl'>
                {itemActions.map((action, _index) => (
                  <>
                    <ButtonSecondary
                      selected={false}
                      key={`-${_index}`}
                      onClick={() => action.exec(String(_index))}
                      className='items-center '
                      hoverScaleDirection='x'
                    >
                      <FontAwesomeIcon icon={action.icon} />
                      {action.actionName && <span className='ml-2'>{action.actionName}</span>}
                    </ButtonSecondary>
                  </>
                ))}
              </div>
            </>
          ) : (
            <>
              {Array.isArray(listItems) && (
                <>
                  <>
                    {listItems.map((item, index) => (
                      <Frame
                        parentBorderColor='border-none'
                        key={`${item.id} - ${index}`}
                        className={`flex items-center justify-between rounded-none border-none bg-gray-900 text-xl${
                          noHoverOutline
                            ? ''
                            : `hover:z-10 hover:outline ${
                                hoverOutlineColor
                                  ? hoverOutlineColor
                                  : OutlineColors.Default.primary
                              }`
                        }`}
                      >
                        <div className='flex w-full flex-col  text-xl'>
                          <div
                            className={`items:start mb-2 flex w-full ${
                              forceButtonsRow ? 'flex-row' : 'flex-col'
                            } justify-between md:flex-row md:items-center`}
                          >
                            <div className='flex w-full items-center gap-4 md:w-1/2'>
                              {item.srcImageUrl && (
                                <img
                                  src={item.srcImageUrl}
                                  className='h-14 w-14 object-scale-down'
                                />
                              )}
                              {item.name}
                            </div>
                            <div className='flex flex-wrap items-end gap-2 '>
                              {itemActions.map((action, _index) => (
                                <>
                                  <ButtonSecondary
                                    selected={false}
                                    key={`action-${index}-${_index}`}
                                    onClick={() => action.exec(item.id)}
                                    className='items-center '
                                    hoverScaleDirection='x'
                                  >
                                    <FontAwesomeIcon icon={action.icon} />
                                    {action.actionName && (
                                      <span className='ml-2'>{action.actionName}</span>
                                    )}
                                  </ButtonSecondary>
                                </>
                              ))}
                            </div>
                          </div>
                          <>{expandedItemIndex === index && <>{children}</>}</>
                        </div>
                      </Frame>
                    ))}
                  </>
                  <>
                    {listItems.length === 0 && (
                      <Frame
                        parentBorderColor='border-none'
                        className={`flex items-center justify-between rounded-none border-none bg-gray-900 text-xl`}
                      >
                        <div>No items</div>
                      </Frame>
                    )}
                  </>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
