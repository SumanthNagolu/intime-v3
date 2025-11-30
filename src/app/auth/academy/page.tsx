import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Training Academy - Sign In | InTime',
  description: 'Sign in to access your InTime Training Academy dashboard',
};

export default function AcademyAuthPage() {
  redirect('/login');
}






