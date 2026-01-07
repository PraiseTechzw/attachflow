import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function DocumentsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">Upload and manage your attachment-related documents.</p>
                </div>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            <Card className="flex flex-col items-center justify-center border-dashed min-h-[400px]">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle>No Documents Found</CardTitle>
                    <CardDescription>Start by uploading your reports, proposals, or certificates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload First Document
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
// Dummy icon since FileText is not in lucide-react
const FileText = (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
