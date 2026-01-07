'use client';
import { ProjectForm } from "@/components/projects/project-form";
import { useFirebase } from "@/firebase/provider";
import { useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import type { Project } from "@/types";

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
    const { firestore, user } = useFirebase();

    const projectRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}/projects`, params.projectId);
    }, [firestore, user, params.projectId]);

    const { data: project, isLoading } = useDoc<Project>(projectRef);
    
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Project not found</h1>
                <p className="text-muted-foreground">The requested project could not be located.</p>
            </div>
        )
    }
    
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
                <p className="text-muted-foreground">
                    Update the details of your project.
                </p>
            </div>
            <ProjectForm project={project} />
        </div>
    );
}