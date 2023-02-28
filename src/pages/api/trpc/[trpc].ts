import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/trpc/root';
import { createTRPCContext } from '../../../server/trpc/trpc';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    'development' === 'development'
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path}: ${error}`);
        }
      : undefined,
});
