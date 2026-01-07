import { useAuth as useFirebaseAuth } from '@/lib/providers';

export const useAuth = () => {
  return useFirebaseAuth();
};
