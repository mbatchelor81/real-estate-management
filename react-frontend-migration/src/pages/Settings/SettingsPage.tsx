import { Card, CardContent, CardTitle, Button } from '@/components/ui';

export default function SettingsPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>Settings</CardTitle>
          <p className="mt-2 text-gray-600">Configure your application preferences.</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium text-gray-900">Dark Mode</h4>
                <p className="text-sm text-gray-500">Toggle dark theme for the application</p>
              </div>
              <Button variant="outline" size="sm">
                Toggle
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-500">Manage notification preferences</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
