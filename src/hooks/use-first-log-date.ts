'use client';
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { DailyLog } from "@/types";
import { useMemo } from "react";

export const useFirstLogDate = () => {
    const { user, firestore } = useFirebase();

    // Query to get the first (oldest) log
    const firstLogQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, `users/${user.uid}/dailyLogs`), 
            orderBy('date', 'asc'), 
            limit(1)
        );
    }, [firestore, user]);

    const { data: firstLogData, isLoading } = useCollection<DailyLog>(firstLogQuery);

    const firstLogDate = useMemo(() => {
        if (!firstLogData || firstLogData.length === 0) return null;
        return firstLogData[0].date?.toDate() || null;
    }, [firstLogData]);

    return { firstLogDate, isLoading };
};