# **App Name**: AttachFlow

## Core Features:

- User Authentication: Secure user authentication using Firebase Authentication with email/password and role-based access control.
- Log Management: Users can create, read, update, and delete daily logs related to their attachment, including text and file uploads.
- Project Submission: Users can submit project proposals and final reports, including necessary document uploads.
- Document Uploads: Securely upload and manage documents (e.g., PDFs, DOCs) to Firebase Storage.
- Document Generation: Generate professional reports in PDF format using @react-pdf/renderer.
- AI-Powered Feedback: Leverage Google Generative AI (Gemini) to provide feedback, suggesting improvements on user logs. The AI tool can decide if, and how, to make the feedback specific to each user's work and goals.
- Real-time Data Synchronization: Real-time updates using Firestore and TanStack Query for optimistic updates and network state management.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for a professional and trustworthy feel.
- Background color: Light gray (#F0F2F5), providing a clean, neutral backdrop.
- Accent color: Teal (#009688) to highlight key interactive elements and provide visual interest.
- Body and headline font: 'Inter', a sans-serif font, for a modern and readable interface.
- Use clear, professional icons from Shadcn/UI to represent actions and data types.
- Implement a clean, responsive layout using Tailwind CSS, focusing on content hierarchy and user experience.
- Use subtle animations to enhance user interaction and provide feedback on actions.