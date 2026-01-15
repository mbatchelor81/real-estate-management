import { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Card, CardContent, Button } from '@/components/ui';
import { storageService } from '@/services';
import type { AmortizationScheduleItem } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MortgageLineChartProps {
  schedule: AmortizationScheduleItem[];
  showRecalculate: boolean;
  onRecalculate: () => void;
}

const CHART_COLORS = {
  balance: 'green',
  principal: 'blue',
  interest: '#d0001d91',
};

export function MortgageLineChart({
  schedule,
  showRecalculate,
  onRecalculate,
}: MortgageLineChartProps): React.ReactElement {
  const [isDark, setIsDark] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTheme = async (): Promise<void> => {
      const darkTheme = await storageService.getDarkTheme();
      setIsDark(darkTheme ?? false);
    };
    void loadTheme();
  }, []);

  const fontColor = isDark ? '#fff' : '#333';

  const processedSchedule =
    schedule.length > 151
      ? schedule.filter((_, i) => i === schedule.length - 1 || i % 2 === 0)
      : schedule;

  const dates = processedSchedule.map((item) => item.date);
  const balance = processedSchedule.map((item) => item.balance);
  const principal = processedSchedule.map((item) => item.accPrincipal);
  const interest = processedSchedule.map((item) => item.accInterest);

  const chartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: 'Balance',
        data: balance,
        borderColor: CHART_COLORS.balance,
        backgroundColor: CHART_COLORS.balance,
      },
      {
        label: 'Principal',
        data: principal,
        borderColor: CHART_COLORS.principal,
        backgroundColor: CHART_COLORS.principal,
      },
      {
        label: 'Interest',
        data: interest,
        borderColor: 'red',
        backgroundColor: CHART_COLORS.interest,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: fontColor,
        },
      },
      title: {
        display: true,
        text: 'Amortization Schedule',
        color: fontColor,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: fontColor,
        },
      },
      y: {
        ticks: {
          color: fontColor,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  const handleRecalculate = (): void => {
    onRecalculate();
    setTimeout(() => {
      chartRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 600);
  };

  return (
    <Card className="relative border border-slate-200 dark:border-slate-700">
      <CardContent className="h-full">
        <div ref={chartRef} className={`chart-container ${showRecalculate ? 'blur-sm' : ''}`}>
          <Line data={chartData} options={options} />
        </div>

        {showRecalculate && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Button onClick={handleRecalculate} className="flex items-center gap-2">
              Re-Calculate
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
