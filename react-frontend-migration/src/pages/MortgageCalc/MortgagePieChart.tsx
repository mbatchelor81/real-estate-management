import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Card, CardContent } from '@/components/ui';
import { storageService } from '@/services';
import type { PieChartData } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface MortgagePieChartProps {
  data: PieChartData | null;
}

const CHART_COLORS = {
  principal: '#428cff',
  interest: '#e0bb2e',
  tax: '#e04055',
  insurance: '#29c467',
};

export function MortgagePieChart({ data }: MortgagePieChartProps): React.ReactElement {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async (): Promise<void> => {
      const darkTheme = await storageService.getDarkTheme();
      setIsDark(darkTheme ?? false);
    };
    void loadTheme();
  }, []);

  const fontColor = isDark ? '#fff' : '#333';

  const chartData: ChartData<'doughnut'> = {
    labels: ['Principal', 'Interest', 'Property Tax', 'Insurance'],
    datasets: [
      {
        label: 'Monthly Payment Breakdown',
        data: data
          ? [
              data.totalMonth - data.interest,
              data.interest,
              data.tax || 0,
              data.insurance || 0,
            ]
          : [0, 0, 0, 0],
        backgroundColor: [
          CHART_COLORS.principal,
          CHART_COLORS.interest,
          CHART_COLORS.tax,
          CHART_COLORS.insurance,
        ],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: fontColor,
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Monthly Payment Graph',
        color: fontColor,
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <Card className="flex h-full items-center justify-center border border-slate-200 dark:border-slate-700">
      <CardContent className="h-full w-full max-w-[500px] xl:max-h-[520px]">
        <div className="chart-container">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
