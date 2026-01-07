import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const projects = [
    { id: '1', title: 'Attachment Management System', submitted: '2024-07-15', status: 'Approved' },
    { id: '2', title: 'Real-time Chat Application', submitted: '2024-06-20', status: 'Completed' },
    { id: '3', title: 'E-commerce Platform API', submitted: '2024-07-22', status: 'Pending' },
]

const statusVariant = {
    Approved: 'secondary',
    Completed: 'default',
    Pending: 'outline',
    Rejected: 'destructive'
} as const;

export default function ProjectsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your project proposals and reports.</p>
                </div>
                {/* A modal or new page would be used for form */}
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
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
                        {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.title}</TableCell>
                            <TableCell className="text-muted-foreground">{project.submitted}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[project.status as keyof typeof statusVariant] || 'default'}>
                                    {project.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">View</Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
