import { Card, CardContent, CardTitle } from '@/components/ui';

export default function AboutPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>About</CardTitle>
          <p className="mt-2 text-gray-600">
            Real Estate Management is a comprehensive platform for browsing, listing, and managing
            residential, commercial, industrial, and land properties.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Features</h4>
              <ul className="mt-2 list-inside list-disc text-gray-600">
                <li>Interactive map view with property markers</li>
                <li>Advanced search and filtering</li>
                <li>Property listing management</li>
                <li>Mortgage calculator</li>
                <li>Enquiry messaging system</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Technology Stack</h4>
              <p className="mt-2 text-gray-600">
                Built with React, TypeScript, Redux Toolkit, React Router, and Tailwind CSS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
