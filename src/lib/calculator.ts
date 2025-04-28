interface PortfolioStats {
    mean:number;
    inflation_adjusted_mean:number;
    standard_deviation:number;
}

//https://www.youtube.com/watch?v=Yl3NxTS_DgY&t=14s
//https://www.lazyportfolioetf.com/etf/vanguard-total-world-stock-vt/
const vt_historical_stats:PortfolioStats = {
    mean: .0784,
    inflation_adjusted_mean: .0519,
    standard_deviation: .1572
}

//https://stackoverflow.com/a/36481059
// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean:number, stdev:number) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

export enum InvestmentRateMode {
    FIXED,
    RANDOM
  }

export function getInvestmentRate(mode: InvestmentRateMode): number {
    let investment_rate:number;
    if (mode == InvestmentRateMode.FIXED) {
        investment_rate = vt_historical_stats.inflation_adjusted_mean;
    }
    else if(mode==InvestmentRateMode.RANDOM) {
        investment_rate = gaussianRandom(vt_historical_stats.inflation_adjusted_mean, vt_historical_stats.standard_deviation);
    }
    else {
        throw new Error("Unsupported InvestmentRateMode");
    }
    return investment_rate;
}

export function calculateRetirementNumber(annualRetirementSpend: number) {
    //https://investopedia.com/terms/f/four-percent-rule.asp
    return annualRetirementSpend * 25;
}

export function calculateSavingsByYear(initialSavings: number, annualContribution: number, years: number, mode:InvestmentRateMode): number[] {
    let savingsByYear: number[] = [initialSavings];
    let savings = initialSavings;
    for (let i = 1; i < years + 1; i++) {
        let investmentRate = getInvestmentRate(mode);
        savings = savings * (1 + investmentRate) + annualContribution;
        savingsByYear.push(savings);
    }
    return savingsByYear;
}

export function calculateYearsToRetirement(initialSavings: number, annualContribution: number, retirement_number: number): number | undefined {
    const savingsByYear: number[] = calculateSavingsByYear(initialSavings, annualContribution, 50, InvestmentRateMode.FIXED);
    for (let i = 0; i < savingsByYear.length; i++) {
        if (savingsByYear[i] > retirement_number) {
            return i;
        }
    }
}