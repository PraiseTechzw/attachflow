# 🚀 AttachFlow - Professional Attachment Management Platform

A comprehensive Next.js application for managing industrial attachment experiences, built with modern web technologies and AI-powered features.

## ✨ Features

### 📝 **Daily Logging System**
- **Smart Log Creation**: AI-powered log polishing and enhancement
- **Attachment-Based Numbering**: Week/month counting from first log date
- **Sentiment Analysis**: Automatic mood detection and tracking
- **Skill Extraction**: AI identifies and tracks skills from log entries
- **Professional Formatting**: Clean, university-standard output

### 📊 **Advanced Analytics & Reports**
- **Monthly Reports**: AI-generated comprehensive monthly summaries
- **CUT Log Sheets**: Professional Chinhoyi University format
- **PDF Generation**: High-quality document export with proper formatting
- **Progress Tracking**: Visual progress indicators and statistics
- **Attachment Timeline**: Clear visualization of attachment journey

### 🎨 **Modern UI/UX**
- **Beautiful Calendar**: Enhanced date picker with quick navigation
- **Responsive Design**: Works perfectly on all devices
- **Dark/Light Mode**: Full theme support
- **Gradient Animations**: Smooth, professional animations
- **Glass Morphism**: Modern design elements

### 🤖 **AI-Powered Features**
- **Log Enhancement**: Transform raw entries into professional content
- **Feedback Generation**: Supervisor-style feedback with scorecards
- **Report Generation**: Comprehensive monthly and final reports
- **Skill Analysis**: Automatic skill identification and tracking

### 📱 **Cross-Platform**
- **Web Application**: Full-featured Next.js web app
- **Mobile App**: Flutter companion app (in development)
- **Offline Support**: Works without internet connection
- **Real-time Sync**: Instant synchronization across devices

### 🔐 **Security & Authentication**
- **Firebase Auth**: Secure user authentication
- **Role-Based Access**: Student, supervisor, and admin roles
- **Data Privacy**: Encrypted data storage and transmission
- **Firestore Security**: Comprehensive security rules

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful component library
- **React Hook Form** - Form management
- **TanStack Query** - Data fetching and caching

### **Backend & Database**
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Auth** - Authentication
- **Google Genkit** - AI integration

### **AI & ML**
- **Google Gemini** - Large language model
- **Custom AI Flows** - Specialized AI workflows
- **Sentiment Analysis** - Mood detection
- **Content Enhancement** - Professional writing assistance

### **Mobile**
- **Flutter** - Cross-platform mobile development
- **Dart** - Programming language for Flutter

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Turbopack** - Fast bundler
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Cloud project (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/attachflow.git
   cd attachflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase and Google Cloud credentials.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002`

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install Flutter dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the mobile app**
   ```bash
   flutter run
   ```

## 📁 Project Structure

```
attachflow/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   ├── ai/                 # AI flows and integrations
│   └── types/              # TypeScript type definitions
├── mobile/                 # Flutter mobile app
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🎯 Key Features Breakdown

### **Daily Logging**
- Create and manage daily attachment logs
- AI-powered content enhancement
- Automatic skill extraction
- Sentiment analysis and mood tracking
- Professional formatting for university standards

### **Report Generation**
- Monthly reports with AI-generated summaries
- CUT-compliant log sheets
- Final attachment reports
- PDF export with professional formatting
- Customizable templates

### **Analytics Dashboard**
- Progress tracking and statistics
- Skill development visualization
- Attachment timeline
- Performance metrics
- Goal tracking

### **User Management**
- Student profiles with attachment details
- Supervisor access and feedback
- Admin dashboard and controls
- Role-based permissions
- University integration

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore, Storage, and Authentication
3. Add your configuration to `.env`
4. Set up Firestore security rules

### AI Integration
1. Set up Google Cloud project
2. Enable Gemini API
3. Configure Genkit
4. Add API keys to environment

### Mobile Configuration
1. Set up Firebase for mobile
2. Configure platform-specific settings
3. Add necessary permissions
4. Test on devices

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Component Guide](docs/components.md)
- [AI Flows](docs/ai-flows.md)
- [Mobile App](mobile/README.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chinhoyi University of Technology** - For the attachment program requirements
- **Firebase Team** - For the excellent backend services
- **Google AI** - For the powerful Gemini models
- **Vercel** - For the amazing deployment platform
- **Open Source Community** - For the incredible tools and libraries

## 📞 Support

- **Email**: support@attachflow.com
- **Documentation**: [docs.attachflow.com](https://docs.attachflow.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/attachflow/issues)

---

**Built with ❤️ for students and educational institutions worldwide.**