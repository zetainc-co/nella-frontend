import {
  ProfileCardSkeleton,
  OrganizationCardSkeleton,
} from '@/modules/settings/components/settings-skeleton'

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <ProfileCardSkeleton />
      <OrganizationCardSkeleton />
    </div>
  )
}
