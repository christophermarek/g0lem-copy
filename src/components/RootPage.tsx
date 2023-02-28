import { PropsWithChildren, useContext } from 'react';
import { ControlPane } from './ControlPane';
import { ParentProps } from '../pageComponents/Parent';
import { getTabIcon } from './HeaderTabs';
import React from 'react';
import { ModalContext } from '../react/context/ModalContext';

export interface PageControl {
  isOpen: boolean;
  pageId: string;
  title?: string;
  setPageOpen: (open: boolean) => void;
  hidden?: boolean;
  opensModal?: boolean;
}

export const usePageSelector = (pageControls: PageControl[], childPaneButtons?: PageControl[]) => {
  const { setIsOpen } = useContext(ModalContext);

  const selectChildPage = (pageId: string, opensModal: boolean) => {
    console.log('pageControls', pageControls);
    console.log('childPaneButtons', childPaneButtons);
    if (!opensModal) {
      setIsOpen(false);
      pageControls.forEach((pageControl) => {
        pageControl.setPageOpen(pageControl.pageId === pageId);
      });
      childPaneButtons?.forEach((pageControl) => {
        pageControl.setPageOpen(pageControl.pageId === pageId);
      });
    } else {
      // find the current page
      const currentPage = pageControls.find((pageControl) => pageControl.pageId === pageId);
      if (currentPage) {
        currentPage.setPageOpen(true);
      } else {
        const matchingChildPage = childPaneButtons?.find(
          (pageControl) => pageControl.pageId === pageId,
        );
        if (matchingChildPage) {
          matchingChildPage.setPageOpen(true);
        } else {
          alert('No matching tab found');
        }
      }
    }
  };

  return selectChildPage;
};

interface RootPageProps {
  pageTitle: string;
  titleOverride?: string;
  pageControls: PageControl[];
  parentBorderColor?: string;
  selectChildPage: (pageId: string, opensModal: boolean) => void;
  childPaneOpen?: boolean;
  childPaneTitle?: string;
  childPaneButtons?: PageControl[];
  injectedButtons?: React.ReactNode;
  injectedChildButtons?: React.ReactNode;
  hasChildrenBorder?: boolean;
}
export const RootPage: React.FC<PropsWithChildren<ParentProps & RootPageProps>> = ({
  children,
  pageTitle,
  titleOverride,
  pageControls,
  parentBorderColor,
  childPaneOpen,
  childPaneTitle,
  childPaneButtons,
  selectChildPage,
  botParent,
  teamParent,
  injectedButtons,
  injectedChildButtons,
  hasChildrenBorder = false,
}) => {
  return (
    <ControlPane
      parentBorderColor={parentBorderColor}
      // title={}
      title={`${
        titleOverride
          ? titleOverride
          : `${botParent ? botParent.name : teamParent ? teamParent.name : ''} ${pageTitle}`
      }`}
      // title={`${botParent ? botParent.name : teamParent ? teamParent.name : ''} ${pageControls.find((pageControl) => pageControl.isOpen)?.pageId}}`}
      isHeaderPane={true}
      childrenPaddingOverride='py-0 px-0'
      hasChildrenBorder={hasChildrenBorder}
      widthOverride='w-full'
      buttons={
        pageControls &&
        pageControls.map((pageControl) => {
          return {
            isHidden: pageControl.hidden,
            icon: getTabIcon(pageControl.pageId),
            onClick: () => selectChildPage(pageControl.pageId, pageControl.opensModal || false),
            isActive: pageControl.isOpen,
            text: pageControl.title ? pageControl.title : pageControl.pageId,

            isVisible: true,
            selected: pageControl.isOpen,
            widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
          };
        })
      }
      childPaneOpen={childPaneOpen}
      childPaneTitle={childPaneTitle}
      childPaneButtons={
        childPaneButtons &&
        childPaneButtons.map((pageControl) => {
          return {
            isHidden: pageControl.hidden,
            icon: getTabIcon(pageControl.pageId),
            onClick: () => selectChildPage(pageControl.pageId, pageControl.opensModal || false),
            isActive: pageControl.isOpen,
            text: pageControl.pageId,
            isVisible: true,
            selected: pageControl.isOpen,
            widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
          };
        })
      }
      injectedButtons={injectedButtons}
      injectedChildButtons={injectedChildButtons}
    >
      {children}
    </ControlPane>
  );
};
