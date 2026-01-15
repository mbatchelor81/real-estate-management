import { Card, CardContent, CardTitle } from '@/components/ui';

export default function PropertiesPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>Properties</CardTitle>
          <p className="mt-2 text-gray-600">
            Browse all property listings with search, filter, and sort capabilities. Supports
            infinite scroll pagination.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
