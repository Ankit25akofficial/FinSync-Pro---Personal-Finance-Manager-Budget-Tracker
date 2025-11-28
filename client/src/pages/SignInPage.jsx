import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gradient mb-2">FinSync Pro</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-transparent shadow-none',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 border border-white/20',
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
              footerActionLink: 'text-purple-400 hover:text-purple-300',
            },
          }}
        />
      </motion.div>
    </div>
  );
};

export default SignInPage;

