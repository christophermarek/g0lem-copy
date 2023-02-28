import {
  faArrowCircleDown,
  faArrowCircleUp,
  faCircleCheck,
  faCirclePlus,
  faCircleXmark,
  faCopy,
  faEllipsisVertical,
  faTrash,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import {
  JobStage,
  JobStateReducerAction,
  jobStagesToApiJobStagesSerializer,
} from '../../../react/reducers/jobStageReducer';
import { ToastTypes, fireToast } from '../../../react/hooks/useToast';
import { JobStageComponent } from '../../../pageComponents/jobs/JobBuilder/JobStage';
import React from 'react';
import { api } from '../../../utils/api';
import { ParentProps } from '../../Parent';
import { Form, FormField, TextFormField } from '../../../components/Form/Form';
import { Modal } from '../../../components/modals/Modal';
import { ActionPicker } from './ActionPicker';
import { OutlineColors, TabColors } from '../../../components/HeaderTabs';
import { ListPrimary } from '../../../components/ListPrimary';
import { ControlPane } from '../../../components/ControlPane';
import { ButtonSecondary } from '../../../components/buttonSecondary';

interface JobBuilderProps {
  jobStages: JobStage[];
  dispatchJobStagesReducer: React.Dispatch<JobStateReducerAction>;
  setOpenJobBuilder: React.Dispatch<React.SetStateAction<boolean>>;
  openJobBuilder: boolean;
  selectedJob: {
    id: string;
    name: string;
  };
  setSelectedJob: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
    }>
  >;
  selectPage: (pageId: string, opensModal: boolean) => void;
  jobFormFields: FormField[];
  setJobFormFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  // refetch: any;
}
export const JobBuilder: React.FC<ParentProps & JobBuilderProps> = ({
  jobStages,
  dispatchJobStagesReducer,
  botParent,
  teamParent,
  setOpenJobBuilder,
  selectedJob,
  setSelectedJob,
  openJobBuilder,
  selectPage,
  jobFormFields,
  setJobFormFields,
  // refetch,
}) => {
  const [openActionSelector, setOpenActionSelector] = useState<boolean>(false);
  const [prevStageForActionPicker, setPrevStageForActionPicker] = useState<JobStage | undefined>(
    undefined,
  );
  const [stageIndexForActionPicker, setStageIndexForActionPicker] = useState<number>(0);

  const _openActionSelector = (stageIndex: number, prevStage: JobStage | undefined) => {
    setOpenActionSelector(true);
    setPrevStageForActionPicker(prevStage);
    setStageIndexForActionPicker(stageIndex);
  };

  return (
    <>
      {/* <ControlPane
        title={`${selectedJob.id === '' ? 'Add ' : 'Edit '} Job`}
        // setOpenModal={setOpenJobBuilder}
        parentBorderColor={TabColors.Jobs.secondary}
        // closeFunction={closeJobBuilder}
        // openModalState={openJobBuilder}
        // noClickOutside
        buttons={}
        hasChildrenBorder={false}
      > */}
      <div className={' flex flex-col gap-3 overflow-y-scroll py-5'}>
        {openActionSelector && (
          <ActionPicker
            setOpenActionSelector={setOpenActionSelector}
            dispatchJobStagesReducer={dispatchJobStagesReducer}
            stageIndex={stageIndexForActionPicker}
            prevJobStage={prevStageForActionPicker}
          />
        )}
        <div className=''>
          <Form
            gridCols='1'
            noSubmitButton
            formFields={jobFormFields}
            setFormFields={setJobFormFields}
            OutlineColor={OutlineColors.Jobs.secondary}
          />
        </div>
        {jobStages.map((jobStage, stageIndex) => (
          <div key={`jobStage-${stageIndex}`} className=''>
            <ListPrimary
              hoverOutlineColor={OutlineColors.Jobs.secondary}
              expandedItemIndex={0}
              listItems={[
                {
                  name: `Stage ${stageIndex + 1}`,
                  id: '1',
                },
              ]}
              itemActions={[
                {
                  icon: faTrash,
                  exec: async (id: string) => {
                    dispatchJobStagesReducer({
                      type: 'deleteStage',
                      payload: { stageIndex },
                    });
                  },
                  actionName: 'Delete',
                },
                {
                  icon: faCirclePlus,
                  exec: async (id: string) => {
                    _openActionSelector(stageIndex, jobStages[stageIndex - 1]);
                  },
                  actionName: 'Action(s)',
                },
                {
                  icon: faArrowCircleUp,
                  exec: async (id: string) => {
                    dispatchJobStagesReducer({
                      type: 'moveStage',
                      payload: { direction: 'up', stageIndex },
                    });
                  },
                  actionName: 'Move',
                },
                {
                  icon: faArrowCircleDown,
                  exec: async (id: string) => {
                    dispatchJobStagesReducer({
                      type: 'moveStage',
                      payload: { direction: 'down', stageIndex },
                    });
                  },
                  actionName: 'Move',
                },
              ]}
            >
              <JobStageComponent
                key={`job-${stageIndex}`}
                stageIndex={stageIndex}
                dispatchJobStagesReducer={dispatchJobStagesReducer}
                job={jobStage}
                setOpenActionSelector={setOpenActionSelector}
                previousStage={stageIndex === 0 ? undefined : jobStages[stageIndex - 1]}
                teamParent={teamParent}
              />
            </ListPrimary>
          </div>
        ))}
        {/* {jobStages.length === 0 && ( */}
        <ButtonSecondary
          className='mx-2 flex w-fit items-center justify-start gap-2 text-lg'
          onClick={() => dispatchJobStagesReducer({ type: 'addJobStep' })}
        >
          <FontAwesomeIcon className={``} icon={faCirclePlus} />
          Add Stage
        </ButtonSecondary>
        {/* )} */}
      </div>
    </>
  );
};
