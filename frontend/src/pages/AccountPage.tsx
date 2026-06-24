import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg">
      <PageHeader title="Account" />

      <div className="rounded-xl border border-border bg-surface p-5">
        <dl className="grid gap-4">
          <div>
            <dt className="text-xs font-medium text-muted mb-0.5">Email</dt>
            <dd className="text-sm font-medium text-navy">{user?.email}</dd>
          </div>
          <div className="border-t border-border pt-4">
            <dt className="text-xs font-medium text-muted mb-0.5">Email verified</dt>
            <dd>
              {user?.is_email_verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Not verified
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
