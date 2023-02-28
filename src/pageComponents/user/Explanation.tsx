import { TabColors } from '../../components/HeaderTabs';
import { ButtonSecondary } from '../../components/buttonSecondary';
import { faBots, faMailchimp, faReddit } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ControlPane } from '../../components/ControlPane';
import {
  faFileText,
  faLock,
  faMailBulk,
  faMailForward,
  faPaintBrush,
  faPeopleGroup,
  faRobot,
  faServer,
} from '@fortawesome/free-solid-svg-icons';

interface ExplanationPageProps {}

export const ExplanationPage: React.FC<ExplanationPageProps> = ({}) => {
  return (
    <ControlPane
      parentBorderColor={TabColors.Default.primary}
      title={`Testing`}
      isHeaderPane={true}
      childrenPaddingOverride='py-2 px-2'
      hasChildrenBorder={false}
      buttons={[]}
      noRoundedBottom
    >
      We use the GPT model text-davinci-003 and DALL-E to generate outputs for bots. Use the free
      chat GPT to test your outputs.
      <div className='flex flex-wrap  gap-x-2'>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faRobot} />
          <a href='https://chat.openai.com/' target='_blank' rel='noreferrer'>
            Chat GPT
          </a>
        </ButtonSecondary>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faPaintBrush} />
          <a href='https://labs.openai.com/' target='_blank' rel='noreferrer'>
            DALL-E
          </a>
        </ButtonSecondary>
      </div>
      Intelligent prompt design is important for meaningful outputs. Read and test these prompts to
      get a better understanding of how to write them.
      <div className='flex flex-wrap  gap-x-2'>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faFileText} />
          <a href='https://github.com/f/awesome-chatgpt-prompts' target='_blank' rel='noreferrer'>
            Prompts
          </a>
        </ButtonSecondary>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faPeopleGroup} />
          <a href=' https://platform.openai.com/docs/models/gpt-3' target='_blank' rel='noreferrer'>
            GPT model
          </a>
        </ButtonSecondary>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faServer} />
          <a
            href=' https://platform.openai.com/docs/api-reference/completions/create'
            target='_blank'
            rel='noreferrer'
          >
            API Reference
          </a>
        </ButtonSecondary>
      </div>
      To test your outputs you can use the g0lem subreddit or the g0lem discord server.
      <div className='flex flex-wrap gap-x-2'>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faReddit} />
          <a href='https://www.reddit.com/r/g0lem/' target='_blank' rel='noreferrer'>
            Reddit
          </a>
        </ButtonSecondary>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faReddit} />
          <a href='https://discord.gg/uK6pqG59xz' target='_blank' rel='noreferrer'>
            Discord
          </a>
        </ButtonSecondary>
      </div>
      Use protonmail and this password generator for any twitter, reddit, discord accounts you make.
      Aim to make these accounts secure and anonymous.
      <div className='flex flex-wrap  gap-x-2'>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faMailBulk} />
          <a
            href='https://account.proton.me/signup?plan=free&billing=12&ref=prctbl&minimumCycle=12&currency=USD&product=mail&language=en'
            target='_blank'
            rel='noreferrer'
          >
            Proton Mail
          </a>
        </ButtonSecondary>
        <ButtonSecondary className='my-4 items-center gap-4'>
          <FontAwesomeIcon icon={faLock} />

          <a
            href='https://www.lastpass.com/features/password-generator#generatorTool'
            target='_blank'
            rel='noreferrer'
          >
            Password Generator
          </a>
        </ButtonSecondary>
      </div>
    </ControlPane>
  );
};
