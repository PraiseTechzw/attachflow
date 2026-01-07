import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/icons/logo';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-chart-4/5 to-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center space-y-6 mb-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-chart-2/10 to-primary/10 backdrop-blur-sm border border-chart-2/20">
              <Logo className="h-12 w-auto floating" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold gradient-text">
              Create an Account
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Join AttachFlow and transform your attachment experience with our beautiful, intuitive platform.
            </p>
          </div>
        </div>
        
        <div className="backdrop-blur-sm bg-card/50 border border-border/50 rounded-2xl p-8 shadow-2xl">
          <AuthForm type="signup" />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Start your journey with powerful tools designed for success
          </p>
        </div>
      </div>
    </div>
  );
}
