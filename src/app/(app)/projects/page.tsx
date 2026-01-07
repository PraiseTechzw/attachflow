'use client';
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirebase } from "@/firebase/provider";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Project } from "@/types";
import Link from "next/link";


const statusVariant = {
    Approved: 'secondary',
    Completed: 'default',
    Pending: 'outline',
    Rejected: 'destructive'
} as const;

export default function ProjectsPage() {
    const { firestore, user } = useFirebase();

    const projectsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/projects`), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: projects, isLoading } = useCollection<Project>(projectsQuery);
    
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-CA'); // YYYY-MM-DD
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your project proposals and reports.</p>
                </div>
                <Link href="/projects/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </Link>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Project Title</TableHead>
                        <TableHead className="w-[150px]">Date Submitted</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : projects && projects.length > 0 ? (
                            projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.title}</TableCell>
                                <TableCell className="text-muted-foreground">{formatDate(project.createdAt)}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[project.status as keyof typeof statusVariant] || 'default'}>
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/projects/${project.id}`}>
                                        <Button variant="outline" size="sm">View</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
