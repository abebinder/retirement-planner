interface PortfolioStats {
    mean:number;
    standard_deviation:number;
}

//https://curvo.eu/backtest/en/market-index/msci-world?currency=usd
const mcsci_world_index:PortfolioStats = {
    mean: .0986,
    standard_deviation: .1496
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
    let unadjusted_investment_rate:number;
    if (mode == InvestmentRateMode.FIXED) {
        unadjusted_investment_rate = mcsci_world_index.mean;
    }
    else if(mode==InvestmentRateMode.RANDOM) {
        unadjusted_investment_rate = gaussianRandom(mcsci_world_index.mean, mcsci_world_index.standard_deviation);
    }
    else {
        throw new Error("Unsupported InvestmentRateMode");
    }
    //https://investopedia.com/inflation-rate-by-year-7253832#toc-what-is-the-current-inflation-rate
    const inflation_rate = .03;
    return unadjusted_investment_rate - inflation_rate;
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