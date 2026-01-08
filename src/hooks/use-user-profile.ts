'use client';
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/types";

export const useUserProfile = () => {
    console.log('🪝 useUserProfile hook called');
    
    const { user, firestore } = useFirebase();
    
    console.log('🔍 useUserProfile state:', {
        user: user ? { uid: user.uid, email: user.email } : 'No user',
        firestore: firestore ? 'Available' : 'Not available'
    });

    const userProfileRef = useMemoFirebase(() => {
        console.log('📄 Creating userProfileRef memo');
        if (!user) {
            console.log('⚠️ No user available for profile ref');
            return null;
        }
        const ref = doc(firestore, 'users', user.uid);
        console.log('✅ Profile ref created:', ref.path);
        return ref;
    }, [firestore, user]);

    const { data: userProfile, isLoading, error } = useDoc<UserProfile>(userProfileRef);
    
    console.log('📊 useUserProfile result:', {
        userProfile: userProfile ? 'Profile data loaded' : 'No profile data',
        isLoading,
        error: error ? error.message : 'No error',
        profileData: userProfile
    });

    return { userProfile, isLoading, error };
}
