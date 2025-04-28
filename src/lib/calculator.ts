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

export function randomYearlyPercentReturn(): number {
    return gaussianRandom(mcsci_world_index.mean, mcsci_world_index.standard_deviation);
}

export function calculateRetirementNumber(annualRetirementSpend: number) {
    //https://www.investopedia.com/terms/f/four-percent-rule.asp
    return annualRetirementSpend * 25;
}

export function calculateSavingsByYear(initialSavings: number, annualContribution: number, years: number): number[] {
    const investmentRate: number = 0.07;
    let savingsByYear: number[] = [];
    let savings = initialSavings;
    for (let i = 0; i < years + 1; i++) {
        savingsByYear.push(savings);
        savings = savings * (1 + investmentRate) + annualContribution;
    }
    return savingsByYear;
}

export function calculateYearsToRetirement(initialSavings: number, annualContribution: number, retirement_number: number): number | undefined {
    const savingsByYear: number[] = calculateSavingsByYear(initialSavings, annualContribution, 50);
    for (let i = 0; i < savingsByYear.length; i++) {
        if (savingsByYear[i] > retirement_number) {
            return i;
        }
    }
}