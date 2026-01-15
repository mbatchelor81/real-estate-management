import { Card, CardContent, CardTitle } from '@/components/ui';

export default function MortgageCalcPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <CardTitle>Mortgage Calculator</CardTitle>
          <p className="mt-2 text-gray-600">
            Calculate monthly mortgage payments with principal, interest, taxes, and insurance
            breakdown. Includes amortization schedule visualization.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
            </div>
            <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
