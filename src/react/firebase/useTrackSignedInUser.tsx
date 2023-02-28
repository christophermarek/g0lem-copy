import { setUserId } from 'firebase/analytics';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useSsr } from 'usehooks-ts';
import { getAnalyticsObj } from '../../firebase';

export function useTrackSignedInUser() {}
