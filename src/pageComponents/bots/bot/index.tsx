import { PropsWithChildren, useEffect, useState } from 'react';
import { Form, FormField } from '../../../components/Form/Form';
import { api } from '../../../utils/api';
import Jobs from '../../jobs';
import { ParentProps } from '../../Parent';
import { TabColors } from '../../../components/HeaderTabs';
import { BotScheduler } from '../scheduler/BotScheduler';
import { RootPage } from '../../../components/RootPage';
import { BotActivity } from '../BotActivity';

interface BotProps {
  id: string;
  name: string;
}

const Bot: React.FC<PropsWithChildren<ParentProps & BotProps>> = ({ id, name }) => {
  return (
    <></>
    // <>
    //   {bot.isLoading && <div>Loading...</div>}
    //   {bot.isError && <div>Error</div>}
    //   {bot.data?.bot && <>

    //   </>}
    // </>
  );
};

export default Bot;
