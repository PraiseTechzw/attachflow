import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from "docx";
import type { Project, FinalReportAIStructure } from "@/types";
import { format } from "date-fns";

export const generateFinalReportDoc = (
    project: Pick<Project, 'title'>, // Only need title from project
    studentName: string,
    aiContent: FinalReportAIStructure
): Document => {
    // Helper function to create content sections
    const createSection = (title: string, content: string | undefined, headingLevel: typeof HeadingLevel.HEADING_1 = HeadingLevel.HEADING_1) => {
        const paragraphs = [];
        
        // Add heading
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({
                    text: title,
                    bold: true,
                    size: headingLevel === HeadingLevel.HEADING_1 ? 28 : 26,
                }),
            ],
            heading: headingLevel,
            spacing: { before: 400, after: 200 },
        }));

        // Add content paragraphs
        if (content) {
            const contentParagraphs = content.split('\n\n').map(para => 
                new Paragraph({
                    children: [new TextRun({ text: para.trim(), size: 24 })],
                    spacing: { after: 200 },
                })
            );
            paragraphs.push(...contentParagraphs);
        }

        return paragraphs;
    };

    // Create title page section
    const titlePageSection = {
        children: [
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "FINAL ATTACHMENT REPORT",
                        bold: true,
                        size: 32,
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: project.title,
                        bold: true,
                        size: 28,
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Prepared by: ${studentName}`,
                        size: 24,
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Date: ${format(new Date(), 'MMMM dd, yyyy')}`,
                        size: 24,
                    }),
                ],
                alignment: AlignmentType.CENTER,
            }),
            // Add some spacing instead of page break
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
        ],
    };

    // Create content section
    const contentSection = {
        children: [
            ...createSection("1. INTRODUCTION", aiContent.introduction),
            ...createSection("2. MAIN BODY", aiContent.mainBody),
            ...createSection("3. TECHNOLOGIES USED", aiContent.technologiesUsed.join('\n\n')),
            ...createSection("4. CONCLUSION AND RECOMMENDATIONS", aiContent.conclusionAndRecommendations),
        ]
    };

    const doc = new Document({
        creator: "AttachFlow",
        title: "Final Attachment Report",
        description: `Final report for ${project.title}`,
        styles: {
            paragraphStyles: [
                {
                    id: "normalPara",
                    name: "Normal Para",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        font: "Inter",
                        size: 24, // 12pt
                    },
                },
                {
                    id: "listPara",
                    name: "List Para",
                    basedOn: "Normal",
                    quickFormat: true,
                    run: {
                        font: "Inter",
                        size: 24, // 12pt
                    },
                    paragraph: {
                        indent: { left: 720 }, // 0.5 inch indent
                    },
                },
            ],
        },
        sections: [
            {
                properties: {},
                children: [
                    ...titlePageSection.children,
                    ...contentSection.children,
                ]
            }
        ]
    });
    
    return doc;
};