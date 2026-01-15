import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import type {
  MortgageFormValues,
  MortgageCalculationResult,
  AmortizationScheduleItem,
  PieChartData,
} from '@/types';

interface MortgageCoreCalcProps {
  payPerYear?: number;
  simpleMode?: boolean;
  boxShadow?: boolean;
  onFormValueChange?: (data: PieChartData) => void;
  onAmortizationSchedule?: (schedule: AmortizationScheduleItem[]) => void;
  onScheduleChanged?: () => void;
}

const DEFAULT_VALUES: MortgageFormValues = {
  price: '300,000',
  downPayment: '100,000',
  interest: 5,
  term: 30,
  propertyTax: '150',
  insurance: '300',
};

const SIMPLE_MODE_VALUES: MortgageFormValues = {
  ...DEFAULT_VALUES,
  propertyTax: '0',
  insurance: '0',
};

function formatNumberWithCommas(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseFormattedNumber(value: string): number {
  return Number(value.replace(/,/g, ''));
}

function calculateMonthlyPayment(
  price: number,
  interest: number,
  term: number,
  propertyTax: string,
  insurance: string,
  payPerYear: number,
  simpleMode: boolean
): MortgageCalculationResult | null {
  const payPerTotal = term * payPerYear;
  if (!price) {
    return null;
  }

  const interestRate = interest / 100;
  const monthInterest = price * (interestRate / payPerYear);
  const topB = Math.pow(1 + interestRate / payPerYear, payPerTotal);
  const bottom = Math.pow(1 + interestRate / payPerYear, payPerTotal) - 1;
  const top = monthInterest * topB;
  const monthPayment = Number(Math.floor(top / bottom).toFixed(4));

  let total = Math.round(top / bottom);
  if (!simpleMode) {
    total = propertyTax ? total + Number(propertyTax) : total;
    total = insurance ? total + Number(insurance) : total;
  }

  return {
    monthPayment,
    monthAllPayment: total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    monthInterest,
    monthTax: propertyTax,
    monthInsurance: insurance,
    monthPrincipal: monthPayment - monthInterest,
    monthBalance: price - (monthPayment - monthInterest),
    lifetimeTotal: (total * payPerTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  };
}

export function MortgageCoreCalc({
  payPerYear = 12,
  simpleMode = false,
  boxShadow = true,
  onFormValueChange,
  onAmortizationSchedule,
  onScheduleChanged,
}: MortgageCoreCalcProps): React.ReactElement {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MortgageFormValues>({
    defaultValues: simpleMode ? SIMPLE_MODE_VALUES : DEFAULT_VALUES,
    mode: 'onChange',
  });

  const formValues = watch();
  const monthlyPayment = watch('price') ? calculateMonthlyResult()?.monthAllPayment || '0' : '0';
  const lifetimePayment = watch('price') ? calculateMonthlyResult()?.lifetimeTotal || '0' : '0';

  function calculateMonthlyResult(): MortgageCalculationResult | null {
    const { price, downPayment, interest, term, propertyTax, insurance } = formValues;
    const numPrice = parseFormattedNumber(price);
    const numDownPayment = parseFormattedNumber(downPayment);
    const loanAmount = numPrice - numDownPayment;

    if (loanAmount <= 0 || !interest || !term) {
      return null;
    }

    return calculateMonthlyPayment(
      loanAmount,
      interest,
      term,
      propertyTax,
      insurance,
      payPerYear,
      simpleMode
    );
  }

  const getAmortizationSchedule = useCallback((): AmortizationScheduleItem[] => {
    const { price, downPayment, interest, term, propertyTax, insurance } = formValues;
    const numPrice = parseFormattedNumber(price);
    const numDownPayment = parseFormattedNumber(downPayment);
    const loanAmount = numPrice - numDownPayment;

    const result = calculateMonthlyPayment(
      loanAmount,
      interest,
      term,
      propertyTax,
      insurance,
      payPerYear,
      simpleMode
    );

    if (!result) {
      return [];
    }

    const numberOfPayments = payPerYear * term;
    const date = new Date();

    let report: AmortizationScheduleItem = {
      payment: result.monthPayment,
      principal: result.monthPrincipal,
      interest: result.monthInterest,
      balance: result.monthBalance,
      accInterest: result.monthInterest,
      accPrincipal: result.monthPrincipal,
      date: date.toLocaleDateString(),
    };

    const amortization: AmortizationScheduleItem[] = [report];

    for (let i = 0; i < numberOfPayments; i++) {
      const isLast = i === numberOfPayments - 1;
      const payment = isLast
        ? report.payment + (report.balance - report.principal)
        : report.payment;
      const balance = isLast
        ? 0
        : Number(
            (Number(report.balance.toFixed(2)) - Number(report.principal.toFixed(2))).toFixed(2)
          );
      const int = Number(
        (Number(report.balance.toFixed(2)) * (interest / 100 / payPerYear)).toFixed(2)
      );
      const principal = Number((Number(report.payment.toFixed(2)) - int).toFixed(2));
      const accPrincipal = report.accPrincipal + principal;
      const accInterest = report.accInterest + int;
      date.setMonth(date.getMonth() + 1);

      report = {
        payment,
        principal,
        interest: int,
        balance,
        accInterest,
        accPrincipal,
        date: date.toLocaleDateString(),
      };
      amortization.push(report);
    }

    return amortization;
  }, [formValues, payPerYear, simpleMode]);

  const handleFormatValue = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof MortgageFormValues
  ): void => {
    const value = event.target.value;
    if (!value) return;
    const formatted = formatNumberWithCommas(value);
    setValue(fieldName, formatted);
  };

  useEffect(() => {
    const result = calculateMonthlyResult();
    if (result && onFormValueChange) {
      onFormValueChange({
        totalMonth: result.monthPayment,
        interest: result.monthInterest,
        tax: Number(result.monthTax) || 0,
        insurance: Number(result.monthInsurance) || 0,
      });
    }
    if (onScheduleChanged) {
      onScheduleChanged();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.price, formValues.downPayment, formValues.interest, formValues.term, formValues.propertyTax, formValues.insurance]);

  useEffect(() => {
    const timer = setTimeout((): void => {
      const result = calculateMonthlyResult();
      if (result && onFormValueChange) {
        onFormValueChange({
          totalMonth: result.monthPayment,
          interest: result.monthInterest,
          tax: Number(result.monthTax) || 0,
          insurance: Number(result.monthInsurance) || 0,
        });
      }
      if (onAmortizationSchedule) {
        onAmortizationSchedule(getAmortizationSchedule());
      }
    }, 1000);

    return (): void => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDownPaymentGreater =
    parseFormattedNumber(formValues.downPayment) >= parseFormattedNumber(formValues.price);

  const cardClassName = `border border-slate-200 dark:border-slate-700 ${boxShadow ? '' : 'shadow-none'}`;

  return (
    <Card className={cardClassName}>
      <CardHeader className="px-4 py-2 xl:py-3">
        <CardTitle>Monthly {simpleMode ? '' : '& Lifetime'} payments</CardTitle>
      </CardHeader>

      <CardContent>
        <form>
          <div className="grid gap-4">
            <div className="grid gap-4">
              <Input
                label="Price:"
                {...register('price', { required: true, min: 1 })}
                onChange={(e) => handleFormatValue(e, 'price')}
                error={errors.price ? 'Price is required' : undefined}
              />

              <div>
                <Input
                  label="Down Payment:"
                  {...register('downPayment', { required: true, min: 1 })}
                  onChange={(e) => handleFormatValue(e, 'downPayment')}
                  error={errors.downPayment ? 'Down payment is required' : undefined}
                />
                {isDownPaymentGreater && (
                  <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
                    Down payment must be less than the Price
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Interest Rate (%):"
                  type="number"
                  min={0}
                  max={20}
                  step={0.1}
                  {...register('interest', { required: true, max: 20 })}
                  error={errors.interest ? 'Interest rate is required (max 20%)' : undefined}
                />

                <Input
                  label="Loan Term (years):"
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  {...register('term', { required: true, max: 30 })}
                  error={errors.term ? 'Loan term is required (max 30 years)' : undefined}
                />
              </div>

              {!simpleMode && (
                <>
                  <Input
                    label="Property Tax (monthly):"
                    type="number"
                    min={0}
                    {...register('propertyTax')}
                  />

                  <Input
                    label="Property Insurance (monthly):"
                    type="number"
                    min={0}
                    {...register('insurance')}
                  />
                </>
              )}
            </div>

            <div className={`grid ${simpleMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
              <div className="rounded-md bg-blue-50 p-4">
                <div className="text-sm text-gray-600">Monthly Payment</div>
                <div className="text-xl font-bold text-blue-600">${monthlyPayment}</div>
              </div>

              {!simpleMode && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-sm text-gray-600">Total Lifetime</div>
                  <div className="text-xl font-bold text-green-600">${lifetimePayment}</div>
                </div>
              )}
            </div>

            {simpleMode && (
              <div className="border-t border-slate-200 pt-3 text-center dark:border-slate-700">
                <Link to="/mortgage-calc" className="text-blue-600 hover:underline">
                  Mortgage Calculator
                </Link>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
