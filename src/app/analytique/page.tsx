import { getMonthlyStats, getUsersList } from '@/app/actions';
import AnalyticsClient from '@/components/AnalyticsClient';

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ user?: string }>;
}) {
    const users = await getUsersList();

    const params = await searchParams;
    const initialUser = params.user || 'Lucas';
    const initialData = await getMonthlyStats(initialUser);

    return (
        <AnalyticsClient
            key={initialUser}
            initialUser={initialUser}
            initialData={initialData}
            allUsers={users}
        />
    );
}
