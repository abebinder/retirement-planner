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


export function getInvestmentRate(mode: InvestmentRateMode): number {
	let investment_rate: number;
	if (mode == InvestmentRateMode.FIXED) {
		investment_rate = vt_historical_stats.inflation_adjusted_mean;
	} else if (mode == InvestmentRateMode.RANDOM) {
		investment_rate = gaussianRandom({
			mean: vt_historical_stats.inflation_adjusted_mean,
			stdev: vt_historical_stats.standard_deviation
		});
	} else {
		throw new Error('Unsupported InvestmentRateMode');
	}
	return investment_rate;
}


export function runGrowthCombinedWithWithdrawlSimulation(
	initialSavings: number,
	annualContribution: number,
	annualWithdawl: number,
	currentAge: number,
	ageToSwitchToWithdrawl: number,
	investmentRateMode: InvestmentRateMode
): number[] {
	let savingsByYear: number[] = [initialSavings];
	let savings = initialSavings;
	for (let i = currentAge; i < ageToSwitchToWithdrawl; i++) {
		let investmentRate = getInvestmentRate(investmentRateMode);
		savings = savings * (1 + investmentRate) + annualContribution;
		if (savings < 0) {
			return savingsByYear;
		}
		savingsByYear.push(savings);
	}
	for (let i = ageToSwitchToWithdrawl; i < 90; i++) {
		let investmentRate = getInvestmentRate(investmentRateMode);
		savings = savings * (1 + investmentRate) - annualWithdawl;
		if (savings < 0) {
			return savingsByYear;
		}
		savingsByYear.push(savings);
	}
	return savingsByYear;
}

export interface MultipleGrowthCombinedWithWithdrawlSimulationResult {
	fixed_rate_simulation: number[];
	p0_simulation: number[];
	p10_simulation: number[];
	p50_simulation: number[];
	p90_simulation: number[];
	p100_simulation: number[];
	successRate: number;
}

export function runMultipleGrowthCombinedWithWithdrawlSimulations(
	initialSavings: number,
	annualContribution: number,
	annualWithdawl: number,
	num_simulations: number,
	currentAge: number,
	ageToSwitchToWithdrawl: number
): MultipleGrowthCombinedWithWithdrawlSimulationResult {
	console.log('currentAge', currentAge);
	console.log('ageToSwitchToWithdrawl', ageToSwitchToWithdrawl);
	let fixedRateSimulation = runGrowthCombinedWithWithdrawlSimulation(
		initialSavings,
		annualContribution,
		annualWithdawl,
		currentAge,
		ageToSwitchToWithdrawl,
		InvestmentRateMode.FIXED
	);
	let allRandomizedSimulations: number[][] = [];
	let successCount = 0;
	for (let i = 0; i < num_simulations; i++) {
		let simulation = runGrowthCombinedWithWithdrawlSimulation(
			initialSavings,
			annualContribution,
			annualWithdawl,
			currentAge,
			ageToSwitchToWithdrawl,
			InvestmentRateMode.RANDOM
		);
		if (simulation.length >= 90 - currentAge) {
			successCount++;
		}
		allRandomizedSimulations.push(simulation);
	}
	allRandomizedSimulations.sort((a, b) => {
		if (a.length !== b.length) {
			return a.length - b.length; // Sort by length ascending
		}
		return a[a.length - 1] - b[b.length - 1]; // Sort by last element ascending
	});

	return {
		fixed_rate_simulation: fixedRateSimulation,
		p0_simulation: allRandomizedSimulations[0],
		p10_simulation: allRandomizedSimulations[Math.floor(num_simulations * 0.1)],
		p50_simulation: allRandomizedSimulations[Math.floor(num_simulations * 0.5)],
		p90_simulation: allRandomizedSimulations[Math.floor(num_simulations * 0.9)],
		p100_simulation:
			allRandomizedSimulations[allRandomizedSimulations.length - 1],
		successRate: successCount / num_simulations
	};
}

export function runGrowthAndWithdrawlForEachAge(
	initialSavings: number,
	annualContribution: number,
	annualWithdawl: number,
	simulations: number,
	currentAge: number,
	maxRetirementAge: number
): MultipleGrowthCombinedWithWithdrawlSimulationResult[] {
	let allResults: MultipleGrowthCombinedWithWithdrawlSimulationResult[] = [];
	for (let i = currentAge; i < maxRetirementAge; i++) {
		let result = runMultipleGrowthCombinedWithWithdrawlSimulations(
			initialSavings,
			annualContribution,
			annualWithdawl,
			simulations,
			currentAge,
			i
		);
		allResults.push(result);
	}
	return allResults;
}

export function calculateRetirementAge(
	results: MultipleGrowthCombinedWithWithdrawlSimulationResult[],
	currentAge: number,
	confidenceThreshold: number
): number | null {
	for (let i = 0; i < results.length; i++) {
		if (results[i].successRate >= confidenceThreshold) {
			return currentAge + i;
		}
	}
	return null;
}

