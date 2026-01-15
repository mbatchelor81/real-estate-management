import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';

export default function UserProfilePage(): React.ReactElement {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>Profile</CardTitle>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences.</p>
          <form className="mt-4 space-y-4">
            <Input label="Full Name" type="text" placeholder="Your full name" />
            <Input label="Email" type="email" placeholder="Your email" disabled />
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900">Change Password</h4>
              <div className="mt-2 space-y-4">
                <Input label="Current Password" type="password" placeholder="Current password" />
                <Input label="New Password" type="password" placeholder="New password" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
