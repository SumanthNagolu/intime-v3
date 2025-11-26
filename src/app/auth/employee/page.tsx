import { AuthPage } from '@/components/auth/AuthPage';

export const metadata = {
  title: 'InTime OS - Sign In | InTime',
  description: 'Sign in to access the InTime internal operations hub',
};

export default function EmployeeAuthPage() {
  return <AuthPage portal="employee" />;
}



