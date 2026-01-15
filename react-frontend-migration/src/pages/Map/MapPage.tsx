import { Card, CardContent, CardTitle } from '@/components/ui';

export default function MapPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>Map</CardTitle>
          <p className="mt-2 text-gray-600">
            Interactive map view with property markers. This page will display properties on a
            Leaflet map with filtering by property type.
          </p>
          <div className="mt-4 h-96 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">Map placeholder - Leaflet integration pending</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
