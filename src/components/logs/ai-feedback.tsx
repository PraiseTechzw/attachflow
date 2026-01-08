
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Sparkles, Loader2, WandSparkles } from "lucide-react";
import { generateLogFeedback, type GenerateLogFeedbackOutput } from "@/ai/flows/generate-log-feedback";
import { improveLogEntry } from "@/ai/flows/improve-log-entry-flow";
import { Label } from "../ui/label";
import { useFormContext } from "react-hook-form";
import type { DailyLog } from "@/types";
import { useFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

interface AIFeedbackProps {
    log: DailyLog;
    studentGoals: string;
}

const ScorecardItem = ({ title, score, feedback }: { title: string, score: number, feedback: string }) => (
    <div className="space-y-2">
        <div className="flex items-baseline justify-between">
            <Label className="text-sm font-medium">{title}</Label>
            <span className="text-sm font-bold text-primary">{score}/10</span>
        </div>
        <Progress value={score * 10} className="h-2" />
        <p className="text-xs text-muted-foreground pt-1">{feedback}</p>
    </div>
);


export function AIFeedback({ log, studentGoals }: AIFeedbackProps) {
    const [feedback, setFeedback] = useState<GenerateLogFeedbackOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const form = useFormContext(); // Access the form context
    const { firestore, user } = useFirebase();
    const { toast } = useToast();

    const logText = log.activitiesRaw;

    const handleGenerateFeedback = async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        try {
            const result = await generateLogFeedback({ logText: logText, studentGoals });
            setFeedback(result);

            // Format and save the feedback to Firestore
            const formattedFeedback = `Technical Depth: ${result.technicalDepth.score}/10 - ${result.technicalDepth.feedback}\n\nProfessional Tone: ${result.professionalTone.score}/10 - ${result.professionalTone.feedback}\n\nProblem-Solving Clarity: ${result.problemSolvingClarity.score}/10 - ${result.problemSolvingClarity.feedback}`;

            const logRef = doc(firestore, `users/${user.uid}/dailyLogs`, log.id);
            updateDocumentNonBlocking(logRef, { feedback: formattedFeedback });

            toast({
                title: "Critique Generated & Saved",
                description: "AI Mentor feedback has been added as a comment to this log.",
            });

        } catch (err) {
            setError("Failed to generate feedback. The AI may be unavailable or the content could not be processed. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleImproveLog = async () => {
        if (!feedback) return;
        setIsImproving(true);
        try {
            const result = await improveLogEntry({
                logContent: logText,
                critique: feedback,
            });
            // Use setValue from react-hook-form to update the parent form's field
            form.setValue('activitiesRaw', result.improvedContent, { shouldValidate: true, shouldDirty: true });
        } catch (err) {
            setError("Failed to improve the log. Please try again.");
            console.error(err);
        } finally {
            setIsImproving(false);
        }
    }

    return (
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary h-5 w-5"/>
                    AI Mentor
                </CardTitle>
                <CardDescription>Get a supervisor's critique of your log entry.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[150px]">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                {feedback && (
                     <div className="space-y-6">
                        <ScorecardItem title="Technical Depth" score={feedback.technicalDepth.score} feedback={feedback.technicalDepth.feedback} />
                        <ScorecardItem title="Professional Tone" score={feedback.professionalTone.score} feedback={feedback.professionalTone.feedback} />
                        <ScorecardItem title="Problem-Solving Clarity" score={feedback.problemSolvingClarity.score} feedback={feedback.problemSolvingClarity.feedback} />
                    </div>
                )}
                 {!isLoading && !feedback && !error && log.feedback && (
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p className="font-semibold">Previous Feedback:</p>
                        <p className="whitespace-pre-wrap border-l-2 border-primary pl-3">{log.feedback}</p>
                    </div>
                )}
                {!isLoading && !feedback && !error && !log.feedback && (
                    <div className="text-center text-sm text-muted-foreground h-full flex flex-col items-center justify-center">
                        <p>Click below to get a detailed scorecard on your log's quality.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button onClick={handleGenerateFeedback} disabled={isLoading || isImproving || !logText} className="w-full">
                    {isLoading ? "Generating Critique..." : "Critique My Log"}
                </Button>
                {feedback && (
                    <Button onClick={handleImproveLog} disabled={isImproving || isLoading} variant="secondary" className="w-full">
                        {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4"/>}
                        Improve My Log with AI
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
