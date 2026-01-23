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

function getInvestmentRate(): number {
	return gaussianRandom({
		mean: vt_historical_stats.inflation_adjusted_mean,
		stdev: vt_historical_stats.standard_deviation
	});
}


export function runSimulation(
	initialSavings: number,
	annualContribution: number,
	annualWithdawl: number,
	currentAge: number,
	ageToSwitchToWithdrawl: number
): number[] {
	let savingsByYear: number[] = [initialSavings];
	let savings = initialSavings;
	for (let i = currentAge; i < ageToSwitchToWithdrawl; i++) {
		let investmentRate = getInvestmentRate();
		savings = savings * (1 + investmentRate) + annualContribution;
		if (savings < 0) {
			return savingsByYear;
		}
		savingsByYear.push(savings);
	}
	for (let i = ageToSwitchToWithdrawl; i < 90; i++) {
		let investmentRate = getInvestmentRate();
		savings = savings * (1 + investmentRate) - annualWithdawl;
		if (savings < 0) {
			return savingsByYear;
		}
		savingsByYear.push(savings);
	}
	return savingsByYear;
}


export interface SampleSimulation {
	simulationData: number[];
	simulationTitle: string;
}


export interface RunMultipleSimulationsResult {
	sampleSimulations: SampleSimulation[];
	successRate: number;
}

function generateSampleSimulations(
	sortedSimulations: number[][]
): SampleSimulation[] {
	return [
		{
			simulationData: sortedSimulations[0],
			simulationTitle: '0th Percentile Simulation (Worst Case Scenario)'
		},
		{
			simulationData: sortedSimulations[Math.floor(sortedSimulations.length * 0.1)],
			simulationTitle: '10th Percentile Simulation (Very Bad Scenario)'
		},
		{
			simulationData: sortedSimulations[Math.floor(sortedSimulations.length * 0.5)],
			simulationTitle: '50th Percentile Simulation (Median Scenario)'
		},
		{
			simulationData: sortedSimulations[Math.floor(sortedSimulations.length * 0.9)],
			simulationTitle: '90th Percentile Simulation (Very Good Scenario)'
		},
		{
			simulationData: sortedSimulations[sortedSimulations.length - 1],
			simulationTitle: '100th Percentile Simulation (Best Case Scenario)'
		}
	];
}

export function runMultipleSimulations(
	initialSavings: number,
	annualContribution: number,
	annualWithdawl: number,
	num_simulations: number,
	currentAge: number,
	ageToSwitchToWithdrawl: number
): RunMultipleSimulationsResult {
	let simulations: number[][] = [];
	let successCount = 0;
	for (let i = 0; i < num_simulations; i++) {
		let simulation = runSimulation(
			initialSavings,
			annualContribution,
			annualWithdawl,
			currentAge,
			ageToSwitchToWithdrawl
		);
		if (simulation.length >= 90 - currentAge) {
			successCount++;
		}
		simulations.push(simulation);
	}
	simulations.sort((a, b) => {
		if (a.length !== b.length) {
			return a.length - b.length; // Sort by length ascending
		}
		return a[a.length - 1] - b[b.length - 1]; // Sort by last element ascending
	});

	const sampleSimulations = generateSampleSimulations(simulations);

	return {
		sampleSimulations: sampleSimulations,
		successRate: successCount / num_simulations
	};
}

export function runMultipleSimulationsForEachAge(
	initialSavings: number,
	annualContribution: number,
	annualWithdawl: number,
	simulations: number,
	currentAge: number,
	maxRetirementAge: number
): RunMultipleSimulationsResult[] {
	let allResults: RunMultipleSimulationsResult[] = [];
	for (let i = currentAge; i < maxRetirementAge; i++) {
		let result = runMultipleSimulations(
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
	results: RunMultipleSimulationsResult[],
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

