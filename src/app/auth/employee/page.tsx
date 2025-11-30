import { redirect } from 'next/navigation';

export const metadata = {
  title: 'InTime OS - Sign In | InTime',
  description: 'Sign in to access the InTime internal operations hub',
};

export default function EmployeeAuthPage() {
  redirect('/login');
}






