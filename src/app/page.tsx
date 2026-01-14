import { getUsersList } from '@/app/actions';
import DashboardClient from '@/components/DashboardClient';
import UserSelection from '@/components/UserSelection';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const users = await getUsersList();

  const params = await searchParams;
  const targetUser = params.user;

  if (!targetUser) {
    return <UserSelection users={users} />;
  }

  // Fallback if user param exists but is invalid (though rare, we handle it gently)
  const initialUser = users.find((u: any) => u.name === targetUser) || users[0];

  return (
    <DashboardClient key={targetUser} initialUser={initialUser} allUsers={users} />
  );
}
