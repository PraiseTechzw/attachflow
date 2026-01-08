
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Trash2 } from "lucide-react";
import { useFirebase } from "@/firebase/provider";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import { useMemo, useRef, useState } from "react";
import type { Document } from "@/types";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default function DocumentsPage() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const docsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, `users/${user.uid}/documents`);
    }, [firestore, user]);

    const { data: documents, isLoading } = useCollection<Document>(docsQuery);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        setUploadProgress(0);

        const reader = new FileReader();
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                setUploadProgress(progress);
            }
        };
        reader.onload = async (e) => {
            try {
                const dataUrl = e.target?.result as string;
                if (!dataUrl) {
                    throw new Error("Failed to read file.");
                }

                const documentId = uuidv4();
                
                const newDoc: Document = {
                    id: documentId,
                    userId: user.uid,
                    filename: file.name,
                    url: dataUrl, // Store the data URI
                    mimeType: file.type,
                    size: file.size,
                    createdAt: new Date(),
                };
                
                addDocumentNonBlocking(doc(collection(firestore, `users/${user.uid}/documents`), documentId), newDoc);
                
                toast({
                    title: "Document Saved",
                    description: `${file.name} has been successfully saved to Firestore.`,
                });
            } catch (error) {
                console.error("Error saving document:", error);
                toast({
                    variant: "destructive",
                    title: "Save Failed",
                    description: "There was an error saving your document.",
                });
            } finally {
                setIsUploading(false);
            }
        };
        
        reader.onerror = () => {
            console.error("FileReader error");
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "There was an error reading the file.",
            });
            setIsUploading(false);
        };
        
        reader.readAsDataURL(file);
    };
    
    const handleDelete = async (docToDelete: Document) => {
        if (!user) return;
        try {
            // Only need to delete from Firestore
            const docRef = doc(firestore, `users/${user.uid}/documents`, docToDelete.id);
            await deleteDoc(docRef);

            toast({
                title: "Document Deleted",
                description: `${docToDelete.filename} has been removed.`,
            });
        } catch (error) {
            console.error("Error deleting document:", error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete the document.",
            });
        }
    }

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }


    return (
        <div className="container mx-auto py-8">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">Upload and manage your attachment-related documents.</p>
                </div>
                <Button onClick={handleUploadClick} disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            {isUploading && (
                <div className="mb-8 space-y-2">
                    <p className="text-sm font-medium text-center">Reading file...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
                </div>
            )}

            {isLoading && !isUploading && (
                <div className="flex items-center justify-center border-dashed min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && documents && documents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {documents.map((doc) => (
                         <Card key={doc.id} className="group relative card-hover">
                         <CardHeader>
                           <div className="flex items-start justify-between">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(doc)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                           </div>
                         </CardHeader>
                         <CardContent>
                           <CardTitle className="text-base truncate leading-tight mb-1" title={doc.filename}>
                            <Link href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                             {doc.filename}
                            </Link>
                           </CardTitle>
                           <CardDescription className="text-xs">{formatBytes(doc.size)}</CardDescription>
                         </CardContent>
                       </Card>
                    ))}
                </div>
            ) : null}

            {!isLoading && !isUploading && (!documents || documents.length === 0) && (
                 <Card className="flex flex-col items-center justify-center border-dashed min-h-[400px]">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle>No Documents Found</CardTitle>
                        <CardDescription>Start by uploading your reports, proposals, or certificates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleUploadClick} disabled={isUploading}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload First Document
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
