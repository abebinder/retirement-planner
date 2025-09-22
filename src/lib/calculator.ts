interface PortfolioStats {
	mean: number;
	inflation_adjusted_mean: number;
	standard_deviation: number;
}

//https://www.youtube.com/watch?v=Yl3NxTS_DgY&t=14s
//https://www.lazyportfolioetf.com/etf/vanguard-total-world-stock-vt/
const vt_historical_stats: PortfolioStats = {
	mean: 0.0784,
	inflation_adjusted_mean: 0.0519,
	standard_deviation: 0.1572
};

//https://stackoverflow.com/a/36481059
// Standard Normal variate using Box-Muller transform.
function gaussianRandom(options: { mean: number; stdev: number }): number {
	const u = 1 - Math.random(); // Converting [0,1) to (0,1]
	const v = Math.random();
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	// Transform to the desired mean and standard deviation:
	return z * options.stdev + options.mean;
}

export enum InvestmentRateMode {
	FIXED,
	RANDOM
}

function quantile(data: number[], quantile: number): number | undefined {
	if (data.length === 0) return undefined;
	const sortedData = [...data].sort((a, b) => a - b);
	const index = (sortedData.length - 1) * quantile;
	if (index % 1 === 0) {
		// Exact index
		return sortedData[index];
	} else {
		// Interpolation needed
		const lowerIndex = Math.floor(index);
		const upperIndex = Math.ceil(index);
		const lowerValue = sortedData[lowerIndex];
		const upperValue = sortedData[upperIndex];
		const fraction = index - lowerIndex;
		return lowerValue + (upperValue - lowerValue) * fraction;
	}
}

export function getInvestmentRate(mode: InvestmentRateMode): number {
	let investment_rate: number;
	if (mode == InvestmentRateMode.FIXED) {
		investment_rate = vt_historical_stats.inflation_adjusted_mean;
	} else if (mode == InvestmentRateMode.RANDOM) {
		investment_rate = gaussianRandom({ mean: vt_historical_stats.inflation_adjusted_mean, stdev: vt_historical_stats.standard_deviation });
	} else {
		throw new Error('Unsupported InvestmentRateMode');
	}
	return investment_rate;
}

export function calculateRetirementNumber(annualRetirementSpend: number) {
	//https://investopedia.com/terms/f/four-percent-rule.asp
	return annualRetirementSpend * 25;
}

export function calculateYearsToCoast(options: {
	initialSavings: number;
	annualContribution: number;
	annualRetirementSpend: number;
	currentAge: number;
	maxRetirementAge: number;
}): number | undefined {
	const retirement_number = calculateRetirementNumber(options.annualRetirementSpend);
	const max_years_to_retirement = options.maxRetirementAge - options.currentAge;
	const savingsByYear: number[] = calculateSavingsByYear(
		options.initialSavings,
		options.annualContribution,
		max_years_to_retirement,
		InvestmentRateMode.FIXED
	);
	for (let i = 0; i < savingsByYear.length; i++) {
		if (canCoast(savingsByYear[i], max_years_to_retirement - i, retirement_number)) {
			return i;
		}
	}
	return undefined;
}

export function canCoast(savings: number, yearsLeft: number, retirement_number: number): boolean {
	const savingsByYear = calculateSavingsByYear(savings, 0, yearsLeft, InvestmentRateMode.FIXED);
	return savingsByYear[savingsByYear.length - 1] >= retirement_number;
}

export function calculateWithdrawlSavingsByYear(initialSavings: number, annualRetirementSpend: number, mode: InvestmentRateMode): number[] {
	let savingsByYear = calculateSavingsByYear(initialSavings, -annualRetirementSpend, 99, mode);
	let nonNegativeSavingsByYear = [];
	for (let i = 0; i < savingsByYear.length; i++) {
		if (savingsByYear[i] < 0) {
			return nonNegativeSavingsByYear;
		}
		nonNegativeSavingsByYear.push(savingsByYear[i]);
	}
	return nonNegativeSavingsByYear;
}

export function runMultipleWithdrawlSimulations(initialSavings: number, annualRetirementSpend: number, simulations: number): number[][] {
	let allSavingsByYear: number[][] = [];
	for (let i = 0; i < simulations; i++) {
		let savingsByYear = calculateWithdrawlSavingsByYear(initialSavings, annualRetirementSpend, InvestmentRateMode.RANDOM);
		allSavingsByYear.push(savingsByYear);
	}
	allSavingsByYear.sort((a, b) => a.length - b.length); // Sort by length descending
	return allSavingsByYear;
}

export interface SimulationStats {
	p0: number;
	p10: number;
	p25: number;
	p50: number;
	p75: number;
	p90: number;
	p100: number;
}

export function calculateSimulationStatsForWithdrawl(savingsByYearSimulations: number[][]): SimulationStats {
	let yearsToSurviveInEachSimulation: number[] = [];
	for (let savingsByYear of savingsByYearSimulations) {
		yearsToSurviveInEachSimulation.push(savingsByYear.length);
	}
	let stats = {
		p0: quantile(yearsToSurviveInEachSimulation, 0) as number,
		p10: quantile(yearsToSurviveInEachSimulation, 0.1) as number,
		p25: quantile(yearsToSurviveInEachSimulation, 0.25) as number,
		p50: quantile(yearsToSurviveInEachSimulation, 0.5) as number,
		p75: quantile(yearsToSurviveInEachSimulation, 0.75) as number,
		p90: quantile(yearsToSurviveInEachSimulation, 0.9) as number,
		p100: quantile(yearsToSurviveInEachSimulation, 1) as number
	};
	return stats;
}

export function calculateSavingsByYear(initialSavings: number, annualContribution: number, years: number, mode: InvestmentRateMode): number[] {
	let savingsByYear: number[] = [initialSavings];
	let savings = initialSavings;
	for (let i = 1; i < years + 1; i++) {
		let investmentRate = getInvestmentRate(mode);
		savings = savings * (1 + investmentRate) + annualContribution;
		savingsByYear.push(savings);
	}
	return savingsByYear;
}

export function calculateYearsToRetirement(savingsByYear: number[], retirement_number: number): number | undefined {
	for (let i = 0; i < savingsByYear.length; i++) {
		if (savingsByYear[i] > retirement_number) {
			return i;
		}
	}
}
