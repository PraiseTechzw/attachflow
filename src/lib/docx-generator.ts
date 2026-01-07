import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType, Bullet, Table, TableRow, TableCell, WidthType } from "docx";
import type { Project, FinalReportAIStructure } from "@/types";
import { format } from "date-fns";

export const generateFinalReportDoc = (
    project: Project,
    studentName: string,
    aiContent: FinalReportAIStructure
): Document => {
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
    });

    // --- TITLE PAGE ---
    doc.addSection({
        children: [
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
                text: project.title,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                text: `By: ${studentName}`,
                alignment: AlignmentType.CENTER,
                style: "normalPara"
            }),
             new Paragraph({ text: "" }),
            new Paragraph({
                text: `Date: ${format(new Date(), 'MMMM d, yyyy')}`,
                alignment: AlignmentType.CENTER,
                style: "normalPara"
            }),
        ],
    });

    doc.addSection({
        children: [new PageBreak()]
    });

    // --- MAIN CONTENT ---
    const createSection = (title: string, content: string, headingLevel: HeadingLevel = HeadingLevel.HEADING_1) => {
        const paragraphs = content.split('\n').filter(p => p.trim() !== '').map(p => new Paragraph({ text: p, style: "normalPara", spacing: { after: 150 } }));
        return [
            new Paragraph({
                text: title,
                heading: headingLevel,
                spacing: { after: 200 }
            }),
            ...paragraphs,
            new Paragraph({ text: "" }), // spacing
        ];
    }
    
    // Abstract / Introduction
    const introSection = createSection("Introduction", aiContent.introduction);

    // AI-Generated Chapters
    const aiChapters = aiContent.chapters.flatMap(chapter => 
        createSection(chapter.title, chapter.summary, HeadingLevel.HEADING_2)
    );
    
    const dutiesSection = [
        new Paragraph({ text: "Duties and Responsibilities", heading: HeadingLevel.HEADING_1, spacing: { after: 200 }}),
        ...aiChapters
    ];

    // Technologies Used
    const technologiesSection = [
        new Paragraph({ text: "Technologies Used", heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        ...aiContent.technologiesUsed.map(tech => new Paragraph({
            text: tech,
            bullet: { level: 0 },
            style: "listPara",
        })),
         new Paragraph({ text: "" }),
    ];

    // Conclusion
    const conclusionSection = createSection("Conclusion", aiContent.conclusion);

    doc.addSection({
        children: [
            ...introSection,
            ...dutiesSection,
            ...technologiesSection,
            ...conclusionSection
        ]
    });
    
    return doc;
};
