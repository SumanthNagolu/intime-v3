import { AuthPage } from '@/components/auth/AuthPage';

export const metadata = {
  title: 'Talent Portal - Sign In | InTime',
  description: 'Sign in to access your InTime Talent Portal',
};

export default function TalentAuthPage() {
  return <AuthPage portal="talent" />;
}

