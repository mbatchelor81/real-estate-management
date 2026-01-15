import { useParams } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui';

export default function PropertyDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>Property Details</CardTitle>
          <p className="mt-2 text-gray-600">
            Viewing property: <span className="font-mono text-blue-600">{id}</span>
          </p>
          <div className="mt-4 space-y-4">
            <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
