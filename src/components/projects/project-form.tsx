
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
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { Project } from "@/types";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const projectFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  // Chapter 1
  introduction_background: z.string().optional(),
  introduction_organogram: z.string().optional(),
  introduction_vision: z.string().optional(),
  introduction_mission: z.string().optional(),
  introduction_problemDefinition: z.string().optional(),
  introduction_aim: z.string().optional(),
  introduction_smartObjectives: z.string().optional(),
  introduction_constraints: z.string().optional(),
  introduction_justification: z.string().optional(),
  // Chapter 2
  planning_businessValue: z.string().optional(),
  planning_feasibility_technical: z.string().optional(),
  planning_feasibility_operational: z.string().optional(),
  planning_feasibility_economic: z.string().optional(),
  planning_riskAnalysis: z.string().optional(),
  planning_projectSchedule: z.string().optional(),
  // Chapter 3
  analysis_infoGathering: z.string().optional(),
  analysis_currentSystem: z.string().optional(),
  analysis_processData: z.string().optional(),
  analysis_weaknesses: z.string().optional(),
  analysis_functionalRequirements: z.string().optional(),
  analysis_nonFunctionalRequirements: z.string().optional(),
  // Chapter 4
  design_system: z.string().optional(),
  design_architectural: z.string().optional(),
  design_physical: z.string().optional(),
  design_databaseSchema: z.string().optional(),
  design_packageDiagram: z.string().optional(),
  design_classDiagram: z.string().optional(),
  design_sequenceDiagram: z.string().optional(),
  design_interface_input: z.string().optional(),
  design_interface_output: z.string().optional(),
  design_interface_security: z.string().optional(),
  // Chapter 5
  implementation_coding: z.string().optional(),
  implementation_testing_unit: z.string().optional(),
  implementation_testing_modular: z.string().optional(),
  implementation_testing_acceptance: z.string().optional(),
  implementation_testing_validation: z.string().optional(),
  implementation_testing_verification: z.string().optional(),
  implementation_installation_hardware: z.string().optional(),
  implementation_installation_software: z.string().optional(),
  implementation_installation_db: z.string().optional(),
  implementation_installation_training: z.string().optional(),
  implementation_review: z.string().optional(),
  implementation_backup: z.string().optional(),
  // Appendices
  appendix_userManual: z.string().optional(),
  appendix_sampleCode: z.string().optional(),
  appendix_researchMethodologies: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project;
}

const steps = [
    { id: "details", title: "Project Details" },
    { id: "introduction", title: "Chapter 1: Introduction" },
    { id: "planning", title: "Chapter 2: Planning" },
    { id: "analysis", title: "Chapter 3: Analysis" },
    { id: "design", title: "Chapter 4: Design" },
    { id: "implementation", title: "Chapter 5: Implementation" },
    { id: "appendices", title: "Appendices" },
];

export function ProjectForm({ project }: ProjectFormProps) {
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project || {},
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  async function onSubmit(data: ProjectFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in.' });
        return;
    }
    setIsLoading(true);

    try {
        if (project) {
            const projectRef = doc(firestore, `users/${user.uid}/projects`, project.id);
            updateDocumentNonBlocking(projectRef, { ...data, updatedAt: serverTimestamp() });
            toast({ title: "Project updated successfully!" });
        } else {
            const projectId = uuidv4();
            const newProject = {
                id: projectId, ...data, userId: user.uid, status: 'Pending',
                createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
            };
            addDocumentNonBlocking(collection(firestore, `users/${user.uid}/projects`), newProject);
            toast({ title: "Project created successfully!" });
        }
        router.push('/projects');
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
  
  const renderField = (name: keyof ProjectFormValues, label: string, description: string, isTextarea = true, placeholder?: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          {isTextarea ? <Textarea {...field} placeholder={placeholder || `Content for ${label}...`} className="min-h-[150px]"/> : <Input {...field} placeholder={placeholder} />}
        </FormControl>
        <FormDescription>{description}</FormDescription>
        <FormMessage />
      </FormItem>
    )} />
  );

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Stepper Navigation */}
        <div className="mb-8 flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold tracking-tight">{steps[currentStep].title}</h2>
            <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {currentStep === 0 && (
                <div className="space-y-8">
                    {renderField("title", "Project Title", "The official title of your industrial attachment project.", false, "e.g., Real-time Inventory Management System")}
                    {renderField("description", "Project Description", "A brief, one-paragraph summary of the project.", true, "This project aims to...")}
                </div>
            )}

            {currentStep === 1 && (
                <div className="space-y-8">
                    {renderField("introduction_background", "Background", "Provide the background of the study.")}
                    {renderField("introduction_organogram", "Company Organogram", "Paste an image of the company's organizational structure.", false, "Paste image here")}
                    {renderField("introduction_vision", "Vision Statement", "The vision of the company.")}
                    {renderField("introduction_mission", "Mission Statement", "The mission of the company.")}
                    {renderField("introduction_problemDefinition", "Problem Definition", "Clearly define the problem this project solves.")}
                    {renderField("introduction_aim", "Project Aim", "The primary aim of the project.")}
                    {renderField("introduction_smartObjectives", "SMART Objectives", "List the Specific, Measurable, Achievable, Relevant, and Time-bound objectives.")}
                    {renderField("introduction_constraints", "Constraints", "Describe any limitations or constraints.")}
                    {renderField("introduction_justification", "Justification", "Justify the need for this project.")}
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-8">
                    {renderField("planning_businessValue", "Business Value", "Describe the value this project brings to the business.")}
                    {renderField("planning_feasibility_technical", "Technical Feasibility", "Assess the technical feasibility.")}
                    {renderField("planning_feasibility_operational", "Operational Feasibility", "Assess the operational feasibility.")}
                    {renderField("planning_feasibility_economic", "Economic Feasibility", "Assess the economic feasibility.")}
                    {renderField("planning_riskAnalysis", "Risk Analysis", "Identify and analyze potential project risks.")}
                    {renderField("planning_projectSchedule", "Project Schedule (Gantt Chart)", "Paste an image of your project schedule or Gantt chart.", false, "Paste image here")}
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-8">
                    {renderField("analysis_infoGathering", "Information Gathering Methodologies", "Describe how you gathered information (interviews, surveys, etc.).")}
                    {renderField("analysis_currentSystem", "Current System Analysis", "Analyze the existing system, if any.")}
                    {renderField("analysis_processData", "Process/Data Analysis", "Describe the data and processes involved.")}
                    {renderField("analysis_weaknesses", "Weaknesses of Current System", "Identify the weaknesses of the current system.")}
                    {renderField("analysis_functionalRequirements", "Functional Requirements", "List the functional requirements of the new system.")}
                    {renderField("analysis_nonFunctionalRequirements", "Non-Functional Requirements", "List the non-functional requirements (performance, security, etc.).")}
                </div>
            )}

            {currentStep === 4 && (
                <div className="space-y-8">
                    {renderField("design_system", "System Design", "Describe the overall system design.")}
                    {renderField("design_architectural", "Architectural Design", "Detail the system's architecture.")}
                    {renderField("design_physical", "Physical Design", "Describe the physical components and infrastructure.")}
                    {renderField("design_databaseSchema", "Database Schema (ERD)", "Paste an image of the Entity-Relationship Diagram.", false, "Paste image here")}
                    {renderField("design_packageDiagram", "Program Design: Package/Class Diagrams", "Describe the program's design using diagrams.")}
                    {renderField("design_sequenceDiagram", "Program Design: Sequence Diagrams", "Illustrate object interactions with sequence diagrams.")}
                    {renderField("design_interface_input", "Interface Design: Input", "Describe the system's input interfaces.")}
                    {renderField("design_interface_output", "Interface Design: Output", "Describe the system's output interfaces.")}
                    {renderField("design_interface_security", "Interface Design: Security", "Describe security measures in the interface design.")}
                </div>
            )}

             {currentStep === 5 && (
                <div className="space-y-8">
                    {renderField("implementation_coding", "Coding", "Describe the coding and development process.")}
                    {renderField("implementation_testing_unit", "Testing: Unit Testing", "Detail the unit testing performed.")}
                    {renderField("implementation_testing_modular", "Testing: Modular Testing", "Detail the modular testing.")}
                    {renderField("implementation_testing_acceptance", "Testing: Acceptance Testing", "Detail the acceptance testing.")}
                    {renderField("implementation_testing_validation", "Testing: Validation", "Describe the validation process.")}
                    {renderField("implementation_testing_verification", "Testing: Verification", "Describe the verification process.")}
                    {renderField("implementation_installation_hardware", "Installation: Hardware", "List hardware requirements and installation steps.")}
                    {renderField("implementation_installation_software", "Installation: Software", "List software requirements and installation steps.")}
                    {renderField("implementation_installation_db", "Installation: Database", "Describe database setup and installation.")}
                    {renderField("implementation_installation_training", "Installation: Training", "Outline the user training plan.")}
                    {renderField("implementation_review", "Review and Maintenance", "Describe the review and maintenance plan.")}
                    {renderField("implementation_backup", "Backup and Recovery", "Detail the backup and recovery strategy.")}
                </div>
            )}

            {currentStep === 6 && (
                <div className="space-y-8">
                    {renderField("appendix_userManual", "User Manual", "Provide the user manual for the system.")}
                    {renderField("appendix_sampleCode", "Sample Code", "Include relevant code snippets.")}
                    {renderField("appendix_researchMethodologies", "Research Methodologies", "Detail any research methodologies used.")}
                </div>
            )}


            <div className="flex justify-between pt-8 border-t">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {project ? "Update Project" : "Save Project"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
