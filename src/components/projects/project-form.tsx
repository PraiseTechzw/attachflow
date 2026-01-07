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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Project } from "@/types";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const projectFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  introduction: z.string().optional(),
  methodology: z.string().optional(),
  analysis: z.string().optional(),
  design: z.string().optional(),
  implementation: z.string().optional(),
  conclusion: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      introduction: project?.introduction || "",
      methodology: project?.methodology || "",
      analysis: project?.analysis || "",
      design: project?.design || "",
      implementation: project?.implementation || "",
      conclusion: project?.conclusion || "",
    },
  });

  async function onSubmit(data: ProjectFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in.' });
        return;
    }
    setIsLoading(true);

    try {
        if (project) {
            // Update existing project
            const projectRef = doc(firestore, `users/${user.uid}/projects`, project.id);
            updateDocumentNonBlocking(projectRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
            toast({
                title: "Project updated successfully!",
            });
            router.push('/projects');
        } else {
            // Create new project
            const projectId = uuidv4();
            const newProject = {
                id: projectId,
                ...data,
                userId: user.uid,
                status: 'Pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const projectCollection = collection(firestore, `users/${user.uid}/projects`);
            addDocumentNonBlocking(projectCollection, newProject);

            toast({
                title: "Project created successfully!",
            });
            router.push('/projects');
        }
    } catch (error) {
        console.error("Error saving project:", error);
        toast({
            variant: 'destructive',
            title: `Error ${project ? 'updating' : 'saving'} project`,
            description: "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  const sections = [
    { name: "introduction", label: "Introduction", description: "Briefly introduce your project." },
    { name: "methodology", label: "Methodology", description: "Describe the methods and techniques used." },
    { name: "analysis", label: "Design & Analysis", description: "Explain the design and analysis of your project." },
    { name: "implementation", label: "Implementation", description: "Detail the implementation process." },
    { name: "conclusion", label: "Conclusion", description: "Summarize your findings and conclude the report." },
  ] as const;

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl><Input placeholder="E.g., Real-time Chat Application" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl><Textarea placeholder="A short summary of your project." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-8 pt-4 border-t">
                {sections.map(section => (
                    <FormField
                        key={section.name}
                        control={form.control}
                        name={section.name}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-lg font-semibold">{section.label}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={`Content for ${section.label}...`}
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>{section.description}</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {project ? "Update Project" : "Save Project"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
