"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { DailyLog } from "@/types";

const logFormSchema = z.object({
  content: z.string().min(10, {
    message: "Log content must be at least 10 characters.",
  }),
});

type LogFormValues = z.infer<typeof logFormSchema>;

interface LogFormProps {
  log?: DailyLog;
}

export function LogForm({ log }: LogFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      content: log?.content || "",
    },
  });

  function onSubmit(data: LogFormValues) {
    setIsLoading(true);
    console.log(data);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: `Log ${log ? "updated" : "saved"} successfully!`,
        description: "Your daily progress has been recorded.",
      });
    }, 1500);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Today's Activities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your tasks, progress, and any challenges you faced today."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* File upload component will go here */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {log ? "Update Log" : "Save Log"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
