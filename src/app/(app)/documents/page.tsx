
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, FileText, Loader2, Trash2, Search, LayoutGrid, List, Sparkles, 
  File, FileImage, FileVideo, FileAudio, Archive, Download, Eye, Calendar,
  FolderOpen, CloudUpload, Zap, Star, Filter, SortAsc, MoreVertical,
  FileCheck, Clock, TrendingUp
} from "lucide-react";
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

// File type icons mapping
const getFileIcon = (filename: string, mimeType: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  
  switch (extension) {
    case 'pdf': return FileCheck;
    case 'doc':
    case 'docx': return FileText;
    case 'zip':
    case 'rar':
    case '7z': return Archive;
    case 'txt': return File;
    default: return FileText;
  }
};

// File type colors
const getFileTypeColor = (filename: string, mimeType: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (mimeType.startsWith('image/')) return 'text-green-600 bg-green-50 border-green-200';
  if (mimeType.startsWith('video/')) return 'text-purple-600 bg-purple-50 border-purple-200';
  if (mimeType.startsWith('audio/')) return 'text-orange-600 bg-orange-50 border-orange-200';
  
  switch (extension) {
    case 'pdf': return 'text-red-600 bg-red-50 border-red-200';
    case 'doc':
    case 'docx': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'zip':
    case 'rar':
    case '7z': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'txt': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-primary bg-primary/10 border-primary/20';
  }
};

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

    const documentStats = useMemo(() => {
        if (!documents) return { total: 0, totalSize: 0, recentCount: 0 };
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return {
            total: documents.length,
            totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
            recentCount: documents.filter(doc => 
                doc.createdAt && new Date(doc.createdAt) > weekAgo
            ).length
        };
    }, [documents]);

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
                    url: dataUrl,
                    storagePath: `documents/${user.uid}/${documentId}`,
                    mimeType: file.type,
                    size: file.size,
                    createdAt: new Date(),
                };
                
<<<<<<< HEAD
                addDocumentNonBlocking(doc(collection(firestore, `users/${user.uid}/documents`), documentId), newDoc);
=======
                addDocumentNonBlocking(doc(firestore, `users/${user.uid}/documents`, documentId), newDoc);
>>>>>>> f04748cbf40002b28e6b960d5b9a7adb78193310
                
                toast({
                    title: "Document Uploaded Successfully! 🎉",
                    description: `${file.name} has been securely saved to your document library.`,
                });
            } catch (error) {
                console.error("Error saving document:", error);
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: "There was an error uploading your document. Please try again.",
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
            toast({ 
                variant: "destructive", 
                title: "Upload Failed", 
                description: "Could not read the selected file. Please try again." 
            });
            setUploadingFile(null);
        };
        
        reader.readAsDataURL(file);
    };
    
    const handleDelete = async (docToDelete: Document) => {
        if (!user) return;
        try {
            const docRef = doc(firestore, `users/${user.uid}/documents`, docToDelete.id);
            await deleteDoc(docRef);
            toast({ 
                title: "Document Deleted", 
                description: `${docToDelete.filename} has been permanently removed.` 
            });
        } catch (error) {
            console.error("Error deleting document:", error);
            toast({ 
                variant: "destructive", 
                title: "Deletion Failed", 
                description: "Could not delete the document. Please try again." 
            });
        }
    }

    const handleSummarize = async (docToSummarize: Document) => {
        setIsSummarizing(docToSummarize.id);
        setSummary('');
        try {
            const result = await summarizeDocument({ 
                documentDataUri: docToSummarize.url, 
                mimeType: docToSummarize.mimeType 
            });
            setSummary(result.summary);
        } catch (error) {
            console.error("Error summarizing document:", error);
            toast({ 
                variant: 'destructive', 
                title: 'AI Summarization Failed', 
                description: 'The AI could not process this document. Please try again.' 
            });
            setSummary('Failed to generate summary. Please try again.');
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
    
    const formatDate = (timestamp: any, formatString: string = 'PPP') => {
        if (!timestamp) return 'N/A';
        // Firestore Timestamps have a toDate() method, JS Dates do not.
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, formatString);
    };

    const isUploading = !!uploadingFile;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain,.pdf,application/pdf,image/*,video/*,audio/*,.zip,.rar,.7z" 
            />
            
            {/* Hero Section */}
            <div className="text-center space-y-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-4/5 rounded-3xl -z-10"></div>
                <div className="py-12">
                    <h1 className="text-5xl font-bold tracking-tight gradient-text mb-4">
                        Document Library 📚
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Securely store, organize, and analyze all your attachment-related documents with AI-powered insights.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
                            <FolderOpen className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 mb-1">{documentStats.total}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {formatBytes(documentStats.totalSize)} total storage
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                        <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300">
                            <Clock className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 mb-1">{documentStats.recentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Documents added this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover group bg-gradient-to-br from-primary/10 via-primary/5 to-chart-4/10 border-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-4/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center space-y-3">
                        <div className="p-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300 group-hover:scale-110">
                            <CloudUpload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <Button 
                                onClick={handleUploadClick} 
                                disabled={isUploading}
                                className="font-semibold"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Document
                                    </>
                                )}
                            </Button>
                            <p className="text-sm text-muted-foreground mt-2">Add new files to your library</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <Card className="animate-in slide-in-from-top-2">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <CloudUpload className="h-5 w-5 text-primary animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">Uploading {uploadingFile}</p>
                                    <p className="text-sm text-muted-foreground">Please wait while we process your file...</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}% complete</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search your documents..." 
                        className="pl-10 bg-background/50 backdrop-blur-sm"
                        value={searchQuery}
                        onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <ToggleGroup 
                        type="single" 
                        value={viewMode} 
                        onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')} 
                        className="bg-background/50 backdrop-blur-sm"
                    >
                        <ToggleGroupItem value="grid" aria-label="Grid view" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                            <LayoutGrid className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List view" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                            <List className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && !isUploading && (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading your document library...</p>
                </div>
            )}
            
            {/* Grid View */}
            {!isLoading && filteredDocuments.length > 0 && viewMode === 'grid' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredDocuments.map((doc, index) => {
                        const FileIcon = getFileIcon(doc.filename, doc.mimeType);
                        const colorClass = getFileTypeColor(doc.filename, doc.mimeType);
                        
                        return (
                            <Card 
                                key={doc.id} 
                                className="group relative card-hover flex flex-col justify-between overflow-hidden"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground" 
                                        onClick={() => handleDelete(doc)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
<<<<<<< HEAD
                                
                                <CardHeader className="pb-3">
                                    <div className={`p-3 rounded-xl w-fit ${colorClass} transition-all duration-300 group-hover:scale-110`}>
                                        <FileIcon className="h-8 w-8" />
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="flex-grow space-y-3">
                                    <div>
                                        <CardTitle className="text-base leading-tight mb-2 line-clamp-2" title={doc.filename}>
                                            <Link 
                                                href={doc.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="hover:text-primary transition-colors duration-200"
                                            >
                                                {doc.filename}
                                            </Link>
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="secondary" className="text-xs">
                                                {formatBytes(doc.size)}
                                            </Badge>
                                            {doc.createdAt && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(doc.createdAt), 'MMM dd')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                
                                <CardContent className="pt-0">
                                    <div className="flex gap-2">
=======
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardTitle className="text-base truncate leading-tight mb-1" title={doc.filename}>
                                    <Link href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{doc.filename}</Link>
                                </CardTitle>
                                 <div className="text-xs text-muted-foreground flex items-center justify-between mt-2">
                                            <span>{formatBytes(doc.size)}</span>
                                            {doc.createdAt && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(doc.createdAt, 'MMM dd')}
                                                </span>
                                            )}
                                        </div>
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
                                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
                                    <TableCell className="text-right space-x-2">
>>>>>>> f04748cbf40002b28e6b960d5b9a7adb78193310
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors duration-200" 
                                                    onClick={() => handleSummarize(doc)}
                                                >
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    AI Summary
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <Sparkles className="h-5 w-5 text-primary" />
                                                        AI Summary: {doc.filename}
                                                    </DialogTitle>
                                                </DialogHeader>
                                                {isSummarizing === doc.id ? (
                                                    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
                                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                        <p className="text-muted-foreground">Analyzing document with AI...</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-lg bg-muted/50">
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                {summary || "Click 'AI Summary' to generate an intelligent summary of this document."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            asChild
                                            className="group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-200"
                                        >
                                            <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            
            {/* List View */}
            {!isLoading && filteredDocuments.length > 0 && viewMode === 'list' && (
                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Document</TableHead>
                                <TableHead className="font-semibold">Size</TableHead>
                                <TableHead className="font-semibold">Date Added</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDocuments.map((doc, index) => {
                                const FileIcon = getFileIcon(doc.filename, doc.mimeType);
                                const colorClass = getFileTypeColor(doc.filename, doc.mimeType);
                                
                                return (
                                    <TableRow 
                                        key={doc.id} 
                                        className="group hover:bg-muted/50 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                                    <FileIcon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <Link 
                                                        href={doc.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="hover:text-primary transition-colors duration-200 font-medium truncate block"
                                                        title={doc.filename}
                                                    >
                                                        {doc.filename}
                                                    </Link>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{formatBytes(doc.size)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {doc.createdAt ? format(new Date(doc.createdAt), 'PPP') : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                            onClick={() => handleSummarize(doc)}
                                                        >
                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                            AI
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <Sparkles className="h-5 w-5 text-primary" />
                                                                AI Summary: {doc.filename}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        {isSummarizing === doc.id ? (
                                                            <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
                                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                                <p className="text-muted-foreground">Analyzing document with AI...</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="p-4 rounded-lg bg-muted/50">
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                        {summary || "Click 'AI Summary' to generate an intelligent summary of this document."}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive" 
                                                    onClick={() => handleDelete(doc)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !isUploading && (filteredDocuments.length === 0) && (
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-4/5 opacity-50"></div>
                    <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 relative z-10">
                        <div className="relative">
                            <div className="p-8 rounded-full bg-gradient-to-br from-primary/10 to-chart-4/10 w-fit mx-auto">
                                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
                            </div>
                            <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary/20">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold">
                                {searchQuery ? 'No Matching Documents Found' : 'Your Document Library Awaits! 📚'}
                            </h3>
                            <p className="text-muted-foreground max-w-md leading-relaxed">
                                {searchQuery 
                                    ? `No documents match "${searchQuery}". Try a different search term or upload new documents.`
                                    : 'Start building your digital document collection. Upload reports, certificates, proposals, and more to keep everything organized and accessible.'
                                }
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                                onClick={handleUploadClick} 
                                disabled={isUploading}
                                size="lg"
                                className="font-semibold"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                {searchQuery ? 'Upload New Document' : 'Upload Your First Document'}
                            </Button>
                            {searchQuery && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setSearchQuery('')}
                                    size="lg"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    
