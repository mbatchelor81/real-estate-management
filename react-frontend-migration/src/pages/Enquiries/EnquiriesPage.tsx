import { Card, CardContent, CardTitle } from '@/components/ui';

export default function EnquiriesPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>Enquiries</CardTitle>
          <p className="mt-2 text-gray-600">
            View and manage your property enquiries. Send and receive messages about properties.
          </p>
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
