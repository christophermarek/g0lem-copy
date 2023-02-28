import { faDiscord, faReddit, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { api } from '../../utils/api';
import { Modal } from '../../components/modals/Modal';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TabColors } from '../../components/HeaderTabs';
import { ButtonSecondary } from '../../components/buttonSecondary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, FormField } from '../../components/Form/Form';
import { ParentProps } from '../Parent';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import { get } from 'http';
import { ControlPane } from '../../components/ControlPane';
import { Frame } from '../../components/container';

interface ConnectorCreateProps {
  selectChildPage: (pageId: string, opensModal: boolean) => void;
  setOpenConnectorCreate: Dispatch<SetStateAction<boolean>>;
}

export const ConnectorCreate: React.FC<ParentProps & ConnectorCreateProps> = ({
  setOpenConnectorCreate,
  teamParent,
  selectChildPage,
}) => {
  const addConnectorStep1 = api.oauth.twitterOAuthStep1.useMutation();
  const redditOauthUrl = api.oauth.redditOauthStep1.useMutation();

  const [twitterStep1Url, setTwitterStep1Url] = useState<string>('');
  const [redditStep1Url, setRedditStep1Url] = useState<string>('');

  useEffect(() => {
    const getTwitterStep1Url = async (teamID?: string) => {
      const res = await addConnectorStep1.mutateAsync({
        teamID: teamID,
      });

      if (!res.success || !res.data) {
        fireToast(ToastTypes.error, 'Error adding connector');
        return;
      }

      const toURLSearchParams = Object.entries(res.data.params)
        .map(([key, value]) => {
          return `${key}=${value}`;
        })
        .join('&');

      const oAuthStep1Url = `${res.data.url}?${toURLSearchParams}`;
      setTwitterStep1Url(oAuthStep1Url);
    };
    const getRedditStep1Url = async (teamID?: string) => {
      const res = await redditOauthUrl.mutateAsync({ teamID: teamID });
      if (!res.success || !res.data) {
        fireToast(ToastTypes.error, 'Error adding connector');
        return;
      }

      const toURLSearchParams = Object.entries(res.data.params)
        .map(([key, value]) => {
          return `${key}=${value}`;
        })
        .join('&');

      const oAuthStep1Url = `${res.data.url}?${toURLSearchParams}`;

      setRedditStep1Url(oAuthStep1Url);
    };
    if (!twitterStep1Url) {
      getTwitterStep1Url(teamParent?.id);
    }
    if (!redditStep1Url) {
      getRedditStep1Url(teamParent?.id);
    }
  }, []);

  const connectors = [
    {
      name: 'Twitter',
      url: twitterStep1Url,
      icon: faTwitter,
    },
    {
      name: 'Reddit',
      url: redditStep1Url,
      icon: faReddit,
    },
  ];

  return (
    <>
      <div className=' grid grid-cols-1 place-items-center gap-y-8 px-4 py-8 md:grid-cols-2'>
        {connectors.map((connector) => (
          <>
            {connector.url != '' ? (
              <a href={connector.url} target='_blank' rel='noreferrer' className=''>
                <ButtonSecondary className='items-center gap-4 text-3xl'>
                  <FontAwesomeIcon className='h-12' icon={connector.icon} />
                  {connector.name}
                </ButtonSecondary>
              </a>
            ) : (
              <ButtonSecondary className='items-center gap-4 text-3xl'>
                <FontAwesomeIcon className='h-12' icon={connector.icon} />
                {connector.name}
              </ButtonSecondary>
            )}
          </>
        ))}
      </div>
    </>
  );
};
