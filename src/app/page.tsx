import { getUsersList } from '@/app/actions';
import DashboardClient from '@/components/DashboardClient';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const users = await getUsersList();

  const params = await searchParams;
  const targetUser = params.user || 'Lucas';

  // Default fallback if DB is empty or fails
  const initialUser = users.find((u: any) => u.name === targetUser) || users[0] || { name: 'Lucas', level: 1, logs: [] };

  return (
    <DashboardClient key={targetUser} initialUser={initialUser} allUsers={users} />
  );
}
