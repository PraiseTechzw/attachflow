"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Sparkles, Loader2 } from "lucide-react";
import { generateLogFeedback, type GenerateLogFeedbackOutput } from "@/ai/flows/generate-log-feedback";
import { Label } from "../ui/label";

interface AIFeedbackProps {
    logText: string;
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


export function AIFeedback({ logText, studentGoals }: AIFeedbackProps) {
    const [feedback, setFeedback] = useState<GenerateLogFeedbackOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateFeedback = async () => {
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        try {
            const result = await generateLogFeedback({ logText, studentGoals });
            setFeedback(result);
        } catch (err) {
            setError("Failed to generate feedback. The AI may be unavailable or the content could not be processed. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
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
                {!isLoading && !feedback && !error && (
                    <div className="text-center text-sm text-muted-foreground h-full flex flex-col items-center justify-center">
                        <p>Click below to get a detailed scorecard on your log's quality.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleGenerateFeedback} disabled={isLoading || !logText} className="w-full">
                    {isLoading ? "Generating Critique..." : "Critique My Log"}
                </Button>
            </CardFooter>
        </Card>
    )
}
