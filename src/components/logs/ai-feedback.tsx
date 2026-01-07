"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { generateLogFeedback } from "@/ai/flows/generate-log-feedback";

interface AIFeedbackProps {
    logText: string;
    studentGoals: string;
}

export function AIFeedback({ logText, studentGoals }: AIFeedbackProps) {
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateFeedback = async () => {
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        try {
            const result = await generateLogFeedback({ logText, studentGoals });
            setFeedback(result.feedback);
        } catch (err) {
            setError("Failed to generate feedback. Please try again.");
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
                    AI Feedback
                </CardTitle>
                <CardDescription>Get suggestions on how to improve your log and align with your goals.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[150px]">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                {feedback && (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap font-sans">
                        {feedback}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleGenerateFeedback} disabled={isLoading} className="w-full">
                    {isLoading ? "Generating..." : "Generate Feedback"}
                </Button>
            </CardFooter>
        </Card>
    )
}
