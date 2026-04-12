// ============================================================
// FILE LOCATION: app/layout.tsx
// ============================================================
import '../globals.css';
import { AppShell } from '@/components/app-shell'; 
import { createServerSupabaseClient } from '@/app/utils/supabase_client';

export const metadata = {
  title: 'BlaRiva',
  description: 'Manage your workspace',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  
  // Fetch the secure server-side session
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;

  if (user) {
    const name = user.user_metadata?.full_name || 'User';
    const email = user.email || '';
    
    const initials = name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const role = user.user_metadata?.role || 'Staff';

    userProfile = { name, email, initials, role };
  }

  return (
    // suppressHydrationWarning stops browser extensions from crashing your app
    // <html lang="en" suppressHydrationWarning>
    //   <body suppressHydrationWarning>
        <AppShell user={userProfile}>
          {children}
        </AppShell>
    //   </body>
    // </html>
  );
}