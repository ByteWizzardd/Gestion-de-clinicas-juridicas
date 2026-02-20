import ProfileSkeleton from '@/components/ui/skeletons/ProfileSkeleton';

export default function UserDetailLoading() {
    return <ProfileSkeleton showTabs tabsCount={3} breadcrumbsCount={3} />;
}
