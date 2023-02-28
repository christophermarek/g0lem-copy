import { createTRPCRouter } from './trpc';
import { botRouter } from './routers/bots';
import { twitterOAuthRouterPublic } from './routers/twitterOAuth';
import { userRouter } from './routers/user';
import { publicStatsRouter } from './routers/publicStats';
import { actionsRouter } from './routers/actions';
import { actionLogsRouter } from './routers/actionLogs';
import { testPostRouter } from './routers/testPost';
import { openAiRouter } from './routers/openai';
import { jobRouter } from './routers/jobs';
import { oAuthRouter } from './routers/oauth';
import { twitterRouter } from './routers/twitter';
import { teamsRouter } from './routers/teams/team';
import { jobScheduleRouter } from './routers/jobScheduler';
import { connectorsRouter } from './routers/connectors';
import { marketDataRouter } from './routers/marketData';
import { teamPermissionsRouter } from './routers/teams/teamPermissions';

export interface ApiReturn<T> {
  data?: T;
  success: boolean;
  message: string;
}

export const appRouter = createTRPCRouter({
  bots: botRouter,
  twitterOAuth: twitterOAuthRouterPublic,
  user: userRouter,
  publicStats: publicStatsRouter,
  actions: actionsRouter,
  actionLogs: actionLogsRouter,
  testPost: testPostRouter,
  openAi: openAiRouter,
  jobs: jobRouter,
  oauth: oAuthRouter,
  twitter: twitterRouter,
  jobSchedule: jobScheduleRouter,
  connectors: connectorsRouter,
  marketData: marketDataRouter,

  teams: teamsRouter,
  teamPermissions: teamPermissionsRouter,
});

export type AppRouter = typeof appRouter;
