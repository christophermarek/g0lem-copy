import { useEffect, useState } from 'react';
import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { Form, FormField } from '../../components/Form/Form';
import { TabColors } from '../../components/HeaderTabs';
import { RootPage } from '../../components/RootPage';
import { api } from '../../utils/api';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';

interface ISettingsProps {}

export const Settings: React.FC<ISettingsProps> = () => {
  const bots = api.bots.getBots.useQuery({});
  const teamsList = api.teams.getAllTeamsProfiles.useQuery();

  const connectors = api.oauth.getConnectors.useQuery({});
  const jobs = api.jobs.getJobs.useQuery({});

  const [botToTeamForm, setBotToTeamForm] = useState<FormField[]>([]);
  const [connectorsToTeamForm, setConnectorsToTeamForm] = useState<FormField[]>([]);
  const [jobsToTeamForm, setJobsToTeamForm] = useState<FormField[]>([]);
  const [jobsToBotForm, setJobsToBotForm] = useState<FormField[]>([]);

  useEffect(() => {
    setFormFields();
  }, [bots.data, teamsList.data, connectors.data, jobs.data]);

  const setFormFields = () => {
    setBotToTeamForm([
      {
        type: 'select',
        name: 'Select bot',
        isEditable: true,
        value: bots.data?.[0]?.id || '',
        options:
          bots.data?.map((bot) => ({
            value: bot.id,
            label: `${bot.name} ${
              bot.teamId
                ? ' on team: ' + teamsList.data?.data?.find((team) => team.id === bot.teamId)?.name
                : ''
            }`,
          })) || [],
      },
      {
        type: 'select',
        name: 'Select team',
        isEditable: true,
        value: teamsList.data?.data?.[0].id || '',
        options:
          teamsList.data?.data?.map((team) => ({
            value: team.id,
            label: team.name,
          })) || [],
      },
    ]);
    setConnectorsToTeamForm([
      {
        type: 'select',
        name: 'Select connector',
        isEditable: true,
        value: connectors.data?.[0]?.id || '',
        options:
          connectors.data?.map((connector) => ({
            value: connector.id,
            label: `${connector.type} ${connector.authTypeAccountName} ${
              connector.teamId
                ? ' on team: ' +
                  teamsList.data?.data?.find((team) => team.id === connector.teamId)?.name
                : ''
            }`,
          })) || [],
      },
      {
        type: 'select',
        name: 'Select team',
        isEditable: true,
        value: teamsList.data?.data?.[0]?.id || '',
        options:
          teamsList.data?.data?.map((team) => ({
            value: team.id,
            label: team.name,
          })) || [],
      },
    ]);
    setJobsToTeamForm([
      {
        type: 'select',
        name: 'Select job',
        isEditable: true,
        value: jobs.data?.data?.[0]?.id || '',
        options:
          jobs.data?.data?.map((job) => ({
            value: job.id,
            label: `${job.name} ${
              job.teamId
                ? ' on team: ' + teamsList.data?.data?.find((team) => team.id === job.teamId)?.name
                : ''
            }`,
          })) || [],
      },
      {
        type: 'select',
        name: 'Select team',
        isEditable: true,
        value: teamsList.data?.data?.[0]?.id || '',
        options:
          teamsList.data?.data?.map((team) => ({
            value: team.id,
            label: team.name,
          })) || [],
      },
    ]);
    setJobsToBotForm([
      {
        type: 'select',
        name: 'Select job',
        isEditable: true,
        value: jobs.data?.data?.[0]?.id || '',
        options:
          jobs.data?.data?.map((job) => ({
            value: job.id,
            label: `${job.name} ${
              job.teamId
                ? ' on team: ' + teamsList.data?.data?.find((team) => team.id === job.teamId)?.name
                : ''
            }`,
          })) || [],
      },
      {
        type: 'select',
        name: 'Select bot',
        isEditable: true,
        value: bots.data?.[0]?.id || '',
        options:
          bots.data?.map((bot) => ({
            value: bot.id,
            label: `${bot.name} ${
              bot.teamId
                ? ' on team: ' + teamsList.data?.data?.find((team) => team.id === bot.teamId)?.name
                : ''
            }`,
          })) || [],
      },
    ]);
  };

  const connectBotToTeam = api.teams.botToTeam.useMutation();
  const botToTeam = async () => {
    const botId = botToTeamForm[0].value;
    const teamId = botToTeamForm[1].value;
    if (!botId || !teamId) return fireToast(ToastTypes.error, 'Select bot and team');
    const res = await connectBotToTeam.mutateAsync({ botId, teamId });
    bots.refetch();
    teamsList.refetch();
    setFormFields();
    if (res) {
      fireToast(ToastTypes.success, 'Bot moved to team');
    } else {
      fireToast(ToastTypes.error, 'Bot not moved to team');
    }
  };

  const connectConnectorToTeam = api.teams.connectorToTeam.useMutation();
  const connectorToTeam = async () => {
    const connectorId = connectorsToTeamForm[0].value;
    const teamId = connectorsToTeamForm[1].value;
    if (!connectorId || !teamId) return fireToast(ToastTypes.error, 'Select connector and team');
    const res = await connectConnectorToTeam.mutateAsync({ connectorId, teamId });
    connectors.refetch();
    teamsList.refetch();
    setFormFields();
    if (res) {
      fireToast(ToastTypes.success, 'Connector moved to team');
    } else {
      fireToast(ToastTypes.error, 'Connector not moved to team');
    }
  };
  const connectJobToTeam = api.teams.jobToTeam.useMutation();
  const jobToTeam = async () => {
    const jobId = jobsToTeamForm[0].value;
    const teamId = jobsToTeamForm[1].value;
    if (!jobId || !teamId) return fireToast(ToastTypes.error, 'Select job and team');
    const res = await connectJobToTeam.mutateAsync({ jobId, teamId });
    jobs.refetch();
    teamsList.refetch();
    setFormFields();
    if (res) {
      fireToast(ToastTypes.success, 'Job moved to team');
    } else {
      fireToast(ToastTypes.error, 'Job not moved to team');
    }
  };
  const connectJobToBot = api.jobs.jobToBot.useMutation();
  const jobToBot = async () => {
    const jobId = jobsToBotForm[0].value;
    const botId = jobsToBotForm[1].value;
    if (!jobId || !botId) return fireToast(ToastTypes.error, 'Select job and bot');
    const res = await connectJobToBot.mutateAsync({ id: jobId, botId });
    jobs.refetch();
    bots.refetch();
    setFormFields();
    if (res) {
      fireToast(ToastTypes.success, 'Job moved to bot');
    } else {
      fireToast(ToastTypes.error, 'Job not moved to bot');
    }
  };

  return (
    <ComponentPortalWrapper portal='.portal2'>
      <RootPage
        parentBorderColor={TabColors.Default.primary}
        pageTitle='Settings'
        pageControls={[]}
        selectChildPage={() => {}}
      >
        <div className='px-2 py-2'>
          Bot to a team
          <Form
            formFields={botToTeamForm}
            setFormFields={setBotToTeamForm}
            onSubmit={botToTeam}
            submitButtonText='Move bot to team'
          />
          Connector to team
          <Form
            formFields={connectorsToTeamForm}
            setFormFields={setConnectorsToTeamForm}
            onSubmit={connectorToTeam}
            submitButtonText='Move connector to team'
          />
          Job to team
          <Form
            formFields={jobsToTeamForm}
            setFormFields={setJobsToTeamForm}
            onSubmit={jobToTeam}
            submitButtonText='Move job to team'
          />
          Job to bot
          <Form
            formFields={jobsToBotForm}
            setFormFields={setJobsToBotForm}
            onSubmit={jobToBot}
            submitButtonText='Move job to bot'
          />
        </div>
        {/*  */}
      </RootPage>
    </ComponentPortalWrapper>
  );
};
