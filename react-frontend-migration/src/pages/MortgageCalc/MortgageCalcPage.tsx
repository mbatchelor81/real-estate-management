import { useState, useCallback } from 'react';
import { MortgageCoreCalc } from './MortgageCoreCalc';
import { MortgagePieChart } from './MortgagePieChart';
import { MortgageLineChart } from './MortgageLineChart';
import type { PieChartData, AmortizationScheduleItem } from '@/types';

interface MortgageCalcPageProps {
  simpleMode?: boolean;
}

export default function MortgageCalcPage({
  simpleMode = false,
}: MortgageCalcPageProps): React.ReactElement {
  const [pieChartData, setPieChartData] = useState<PieChartData | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationScheduleItem[]>([]);
  const [showRecalculate, setShowRecalculate] = useState(false);
  const [isFirstChange, setIsFirstChange] = useState(true);

  const handleFormValueChange = useCallback((data: PieChartData): void => {
    setPieChartData(data);
  }, []);

  const handleAmortizationSchedule = useCallback((schedule: AmortizationScheduleItem[]): void => {
    setAmortizationSchedule(schedule);
  }, []);

  const handleScheduleChanged = useCallback((): void => {
    if (isFirstChange) {
      setIsFirstChange(false);
      setShowRecalculate(false);
      return;
    }
    setShowRecalculate(true);
  }, [isFirstChange]);

  const handleRecalculate = useCallback((): void => {
    setShowRecalculate(false);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="mb-4 text-xl font-bold md:text-2xl">How a mortgage calculator can help?</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Buying a <strong>Real-Estate-Property</strong> is one of the largest purchases most people
          will make, so you should think carefully about how you&apos;re going to finance it. You
          can adjust the property price, down payment and mortgage terms to see how your monthly
          payment will change.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <MortgageCoreCalc
            boxShadow={false}
            simpleMode={simpleMode}
            onFormValueChange={handleFormValueChange}
            onAmortizationSchedule={handleAmortizationSchedule}
            onScheduleChanged={handleScheduleChanged}
          />
        </div>
        <div className="xl:col-span-5">
          <MortgagePieChart data={pieChartData} />
        </div>
      </div>

      <div className="my-8 rounded-md bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Your monthly mortgage payment will depend on your Property price, Down payment, Loan
            term, Property taxes, Insurance, and Interest rate.
          </span>
        </div>
      </div>

      <div className="mb-8">
        <MortgageLineChart
          schedule={amortizationSchedule}
          showRecalculate={showRecalculate}
          onRecalculate={handleRecalculate}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold xl:text-xl">
            What is Amortization Schedule Graph?
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Showing the amount of principal and the amount of interest that comprise each payment
            until the loan is paid off at the end of its term.
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Initially, most of your payment goes toward the interest rather than the principal. The
            loan amortization schedule will show as the term of your loan progresses, a larger share
            of your payment goes toward paying down the principal until the loan is paid in full at
            the end of your term.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold xl:text-xl">
            Understanding an Amortization Schedule
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            In an amortization schedule, the percentage of each payment that goes toward interest
            diminishes a bit with each payment and the percentage that goes toward principal
            increases.
          </p>
        </div>
      </div>
    </div>
  );
}
