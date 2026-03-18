export type ProjectPhase = 'CONSTRUCTION' | 'EARLY_OPERATION' | 'OPERATION';
export type TransactionType = 'AMORTIZING' | 'BULLET';

export type FinancialDriversScenario =
  | 'CONSTRUCTION'
  | 'AMORTIZING'
  | 'BULLET';

export type LiquidityRisk = 'EXCELLENT' | 'GOOD' | 'LIMITED';
export type FinancialDriverUnit = 'thousand' | 'million' | 'billion' | 'trillion';


export interface BaseFinancialDriversModel {
  scenario: FinancialDriversScenario;
  closingDate: string | null; // ISO date
  liquidityRisk: LiquidityRisk | null;
}


export interface BaseFinancialDriversModel {
  scenario: FinancialDriversScenario;
  closingDate: string | null; // ISO date
  liquidityRisk: LiquidityRisk | null;
}



export interface ConstructionFinancialDriversModel
  extends BaseFinancialDriversModel {
  scenario: 'CONSTRUCTION';

  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;

  debtToEquity: number | null; // computed
}
export interface AmortizingFinancialDriversModel
  extends BaseFinancialDriversModel {
  scenario: 'AMORTIZING';

  unit: FinancialDriverUnit | null;
  currency: string | null;

  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  cfads: number | null;
  principalPaid: number | null;
  interestExpenses: number | null;

  debtToEquity: number | null; // computed
  dscr: number | null; // computed

  adjustedDebtToEquity: number | null;
  adjustedDebtToEquityClosingDate: string | null;
  adjustedDebtToEquityComment: string | null;

  adjustedDscrIcr: number | null;
  adjustedDscrIcrClosingDate: string | null;
  adjustedDscrIcrComment: string | null;
}



export interface ConstructionFinancialDriversFormValue {
  closingDate: Date | null;
  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  liquidityRisk: LiquidityRisk | null;
}





export interface AmortizingFinancialDriversFormValue {
  unit: FinancialDriverUnit | null;
  currency: string | null;
  closingDate: Date | null;

  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  cfads: number | null;
  principalPaid: number | null;
  interestExpenses: number | null;

  adjustedDebtToEquity: number | null;
  adjustedDebtToEquityClosingDate: Date | null;
  adjustedDebtToEquityComment: string | null;

  adjustedDscrIcr: number | null;
  adjustedDscrIcrClosingDate: Date | null;
  adjustedDscrIcrComment: string | null;

  liquidityRisk: LiquidityRisk | null;
}




export interface ConstructionFinancialDriversPayload {
  scenario: 'CONSTRUCTION';
  closingDate: string | null;
  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  liquidityRisk: LiquidityRisk | null;
}


export interface AmortizingFinancialDriversPayload {
  scenario: 'AMORTIZING';
  unit: FinancialDriverUnit | null;
  currency: string | null;
  closingDate: string | null;

  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  cfads: number | null;
  principalPaid: number | null;
  interestExpenses: number | null;

  adjustedDebtToEquity: number | null;
  adjustedDebtToEquityClosingDate: string | null;
  adjustedDebtToEquityComment: string | null;

  adjustedDscrIcr: number | null;
  adjustedDscrIcrClosingDate: string | null;
  adjustedDscrIcrComment: string | null;

  liquidityRisk: LiquidityRisk | null;
}


export class FinancialDriversMapper {
  static toConstructionPayload(
    formValue: ConstructionFinancialDriversFormValue
  ): ConstructionFinancialDriversPayload {
    return {
      scenario: 'CONSTRUCTION',
      closingDate: this.toIsoDate(formValue.closingDate),
      seniorGrossFinancialDebt: formValue.seniorGrossFinancialDebt,
      juniorMezzanineGrossFinancialDebt: formValue.juniorMezzanineGrossFinancialDebt,
      equity: formValue.equity,
      quasiEquity: formValue.quasiEquity,
      liquidityRisk: formValue.liquidityRisk,
    };
  }

  static toAmortizingPayload(
    formValue: AmortizingFinancialDriversFormValue
  ): AmortizingFinancialDriversPayload {
    return {
      scenario: 'AMORTIZING',
      unit: formValue.unit,
      currency: formValue.currency,
      closingDate: this.toIsoDate(formValue.closingDate),
      seniorGrossFinancialDebt: formValue.seniorGrossFinancialDebt,
      juniorMezzanineGrossFinancialDebt: formValue.juniorMezzanineGrossFinancialDebt,
      equity: formValue.equity,
      quasiEquity: formValue.quasiEquity,
      cfads: formValue.cfads,
      principalPaid: formValue.principalPaid,
      interestExpenses: formValue.interestExpenses,
      adjustedDebtToEquity: formValue.adjustedDebtToEquity,
      adjustedDebtToEquityClosingDate: this.toIsoDate(
        formValue.adjustedDebtToEquityClosingDate
      ),
      adjustedDebtToEquityComment: formValue.adjustedDebtToEquityComment,
      adjustedDscrIcr: formValue.adjustedDscrIcr,
      adjustedDscrIcrClosingDate: this.toIsoDate(
        formValue.adjustedDscrIcrClosingDate
      ),
      adjustedDscrIcrComment: formValue.adjustedDscrIcrComment,
      liquidityRisk: formValue.liquidityRisk,
    };
  }

  private static toIsoDate(value: Date | null): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().slice(0, 10);
  }
}

