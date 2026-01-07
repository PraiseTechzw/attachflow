'use client';
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/types";

export const useUserProfile = () => {
    const { user, firestore } = useFirebase();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading, error } = useDoc<UserProfile>(userProfileRef);

    return { userProfile, isLoading, error };
}
