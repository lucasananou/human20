import { getUsersList } from '@/app/actions';
import RewardsClient from '@/components/RewardsClient';

export default async function RewardsPage({ searchParams }: { searchParams: { user?: string } }) {
    const users = await getUsersList();
    const userName = searchParams.user || 'Lucas';
    const initialUser = users.find((u: any) => u.name === userName) || users[0];

    return <RewardsClient initialUser={initialUser} allUsers={users} />;
}
