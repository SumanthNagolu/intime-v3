import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Client Portal - Sign In | InTime',
  description: 'Sign in to access your InTime Client Portal',
};

export default function ClientAuthPage() {
  redirect('/login');
}








