
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Document as DocxDocument, Packer, Paragraph } from 'docx';
import mammoth from 'mammoth';

const SummarizeDocumentInputSchema = z.object({
  documentDataUri: z.string().describe(
    "The document content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  mimeType: z.string().describe('The MIME type of the document (e.g., "application/vnd.openxmlformats-officedocument.wordprocessingml.document").'),
});

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document content.'),
});

export async function summarizeDocument(input: z.infer<typeof SummarizeDocumentInputSchema>): Promise<z.infer<typeof SummarizeDocumentOutputSchema>> {
  return summarizeDocumentFlow(input);
}

const extractTextFromDocx = async (base64Data: string): Promise<string> => {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to parse DOCX file.');
  }
};

const extractTextFromTxt = (base64Data: string): string => {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return buffer.toString('utf-8');
    } catch (error) {
      console.error('Error extracting text from TXT:', error);
      throw new Error('Failed to parse text file.');
    }
  };

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async (input) => {
    const { documentDataUri, mimeType } = input;
    
    // Extract base64 content from data URI
    const base64Data = documentDataUri.substring(documentDataUri.indexOf(',') + 1);
    let documentText = '';

    // Extract text based on MIME type
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      documentText = await extractTextFromDocx(base64Data);
    } else if (mimeType.startsWith('text/')) {
        documentText = extractTextFromTxt(base64Data);
    }
     else {
      // For now, handle other types by stating we can't process them.
      // PDF processing would require a library like pdf-parse.
      return { summary: "Sorry, I can only summarize .docx and .txt files at the moment." };
    }

    if (!documentText.trim()) {
        return { summary: "The document appears to be empty or I couldn't extract any text from it." };
    }

    // Generate summary using the extracted text
    const { output } = await ai.generate({
      prompt: `Please provide a concise summary of the following document content:\n\n---\n\n${documentText}\n\n---\n\nSummary:`,
      output: {
        schema: SummarizeDocumentOutputSchema
      }
    });

    return output!;
  }
);
