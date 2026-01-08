
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Upload, FileText, Loader2, Trash2, Search, LayoutGrid, List, Sparkles } from "lucide-react";
import { useFirebase } from "@/firebase/provider";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import { useMemo, useRef, useState, useTransition } from "react";
import type { Document } from "@/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { summarizeDocument } from "@/ai/flows/summarize-document-flow";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";

export default function DocumentsPage() {
    const { firestore, user, storage } = useFirebase();
    const { toast } = useToast();
    const [uploadingFile, setUploadingFile] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
    const [summary, setSummary] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const docsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, `users/${user.uid}/documents`);
    }, [firestore, user]);

    const { data: documents, isLoading } = useCollection<Document>(docsQuery);

    const filteredDocuments = useMemo(() => {
        if (!documents) return [];
        return documents.filter(doc =>
            doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [documents, searchQuery]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploadingFile(file.name);
        setUploadProgress(0);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const dataUrl = e.target?.result as string;
                if (!dataUrl) throw new Error("Failed to read file.");

                const documentId = uuidv4();
                
                const newDoc: Document = {
                    id: documentId,
                    userId: user.uid,
                    filename: file.name,
                    url: dataUrl, // Save the data URI directly
                    mimeType: file.type,
                    size: file.size,
                    createdAt: new Date(),
                };
                
                // Using non-blocking add
                addDocumentNonBlocking(doc(collection(firestore, `users/${user.uid}/documents`), documentId), newDoc);
                
                toast({
                    title: "Document Saved",
                    description: `${file.name} has been successfully saved to your records.`,
                });
            } catch (error) {
                console.error("Error saving document:", error);
                toast({
                    variant: "destructive",
                    title: "Save Failed",
                    description: "There was an error saving your document.",
                });
            } finally {
                setUploadingFile(null);
            }
        };

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                setUploadProgress(progress);
            }
        };
        
        reader.onerror = () => {
            console.error("FileReader error");
            toast({ variant: "destructive", title: "Upload Failed", description: "Could not read the selected file." });
            setUploadingFile(null);
        };
        
        reader.readAsDataURL(file); // This triggers the process
    };
    
    const handleDelete = async (docToDelete: Document) => {
        if (!user) return;
        try {
            const docRef = doc(firestore, `users/${user.uid}/documents`, docToDelete.id);
            await deleteDoc(docRef);
            toast({ title: "Document Deleted", description: `${docToDelete.filename} has been removed.` });
        } catch (error) {
            console.error("Error deleting document:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not remove the document record." });
        }
    }

    const handleSummarize = async (docToSummarize: Document) => {
        setIsSummarizing(docToSummarize.id);
        setSummary('');
        try {
            const result = await summarizeDocument({ documentDataUri: docToSummarize.url, mimeType: docToSummarize.mimeType });
            setSummary(result.summary);
        } catch (error) {
            console.error("Error summarizing document:", error);
            toast({ variant: 'destructive', title: 'Summarization Failed', description: 'The AI could not process this document.' });
            setSummary('Failed to generate summary.');
        } finally {
            setIsSummarizing(null);
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

    const isUploading = !!uploadingFile;

    return (
        <div className="container mx-auto py-8">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                <p className="text-muted-foreground">Upload, manage, and analyze your attachment-related documents.</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search documents..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')} aria-label="View mode">
                        <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
                    </ToggleGroup>
                    <Button onClick={handleUploadClick} disabled={isUploading}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>
                </div>
            </div>

            {isUploading && (
                <div className="mb-8 space-y-2">
                    <p className="text-sm font-medium text-center">Uploading {uploadingFile}...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
                </div>
            )}

            {isLoading && !isUploading && (
                <div className="flex items-center justify-center border-dashed min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}
            
            {!isLoading && filteredDocuments.length > 0 && viewMode === 'grid' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredDocuments.map((doc) => (
                         <Card key={doc.id} className="group relative card-hover flex flex-col justify-between">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(doc)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardTitle className="text-base truncate leading-tight mb-1" title={doc.filename}>
                                    <Link href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{doc.filename}</Link>
                                </CardTitle>
                                <CardDescription className="text-xs">{formatBytes(doc.size)}</CardDescription>
                            </CardContent>
                            <CardContent>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleSummarize(doc)}>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Summarize
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>AI Summary of {doc.filename}</DialogTitle>
                                        </DialogHeader>
                                        {isSummarizing === doc.id ? (
                                            <div className="flex items-center justify-center min-h-[150px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                       </Card>
                    ))}
                </div>
            )}
            
            {!isLoading && filteredDocuments.length > 0 && viewMode === 'list' && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Filename</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDocuments.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium truncate max-w-xs">
                                        <Link href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{doc.filename}</Link>
                                    </TableCell>
                                    <TableCell>{formatBytes(doc.size)}</TableCell>
                                    <TableCell>{doc.createdAt ? format(new Date(doc.createdAt), 'PPP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => handleSummarize(doc)}>
                                                    <Sparkles className="mr-2 h-4 w-4" /> AI
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>AI Summary of {doc.filename}</DialogTitle>
                                                </DialogHeader>
                                                {isSummarizing === doc.id ? (
                                                    <div className="flex items-center justify-center min-h-[150px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(doc)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {!isLoading && !isUploading && (filteredDocuments.length === 0) && (
                 <Card className="flex flex-col items-center justify-center border-dashed min-h-[400px]">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle>{searchQuery ? 'No Matching Documents' : 'No Documents Found'}</CardTitle>
                        <CardDescription>
                            {searchQuery ? 'Try a different search term.' : 'Start by uploading your reports, proposals, or certificates.'}
                        </CardDescription>
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
