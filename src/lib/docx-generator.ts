import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from "docx";
import type { DailyLog, Project } from "@/types";
import { format } from "date-fns";

export const generateFinalReport = (project: Project, logs: DailyLog[], studentName: string): Document => {
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
            ],
        },
    });

    // Title Page
    doc.addSection({
        children: [
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

    const createSection = (title: string, content?: string) => {
        const children = [new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
        })];
        
        if (content) {
            const paragraphs = content.split('\n').map(p => new Paragraph({ text: p, style: "normalPara", spacing: { after: 150 } }));
            children.push(...paragraphs);
        }
        
        children.push(new Paragraph({ text: "" })); // spacing
        return children;
    }

    // Report Sections
    const sections = [
        { title: "Introduction", content: project.introduction },
        { title: "Methodology", content: project.methodology },
        { title: "Design & Analysis", content: project.analysis },
        { title: "Implementation", content: project.implementation },
        { title: "Conclusion", content: project.conclusion },
    ];
    
    const reportSections = sections.flatMap(sec => createSection(sec.title, sec.content));


    // Log Summary Section
    const logSummarySection = [
         new Paragraph({
            text: "Appendix: Daily Log Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
        }),
        ...logs.sort((a,b) => a.date.seconds - b.date.seconds).map(log => 
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${format(log.date.toDate(), 'yyyy-MM-dd')}: `,
                        bold: true,
                    }),
                    new TextRun(log.content),
                ],
                style: "normalPara",
                spacing: { after: 100 }
            })
        )
    ];

    doc.addSection({
        children: [...reportSections, new PageBreak(), ...logSummarySection]
    });
    
    return doc;
};
