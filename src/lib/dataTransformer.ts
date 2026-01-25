import { type RunMultipleSimulationsResult } from './simulator';

// Data for confidence by age chart
export function computeConfidenceByAge(
	results: RunMultipleSimulationsResult[],
	currentAge: number
): {
	ages: number[];
	successRates: number[];
} {
	const ages: number[] = [];
	const successRates: number[] = [];
	for (let i = 0; i < results.length; i++) {
		ages.push(currentAge + i);
		successRates.push(results[i].successRate);
	}
	return { ages, successRates };
}

// Dataset for confidence chart
export function createConfidenceDataset(successRates: number[]) {
	return [
		{
			data: successRates,
			label: 'Success Rate'
		}
	];
}

// Calculate working data for a single simulation
export function computeWorkingData(
	simulationData: number[],
	retirementIndex: number
): (number | null)[] {
	const workingData: (number | null)[] = [];
	// Add data up to retirement index
	for (let i = 0; i <= retirementIndex; i++) {
		if (i < simulationData.length) {
			workingData.push(simulationData[i]);
		}
	}
	// Add nulls for the rest
	const remainingLength = simulationData.length - retirementIndex - 1;
	for (let i = 0; i < remainingLength; i++) {
		workingData.push(null);
	}
	return workingData;
}

// Calculate retired data for a single simulation
export function computeRetiredData(
	simulationData: number[],
	retirementIndex: number
): (number | null)[] {
	const retiredData: (number | null)[] = [];
	// Add nulls up to retirement index
	for (let i = 0; i < retirementIndex; i++) {
		retiredData.push(null);
	}
	// Add data from retirement index onwards
	for (let i = retirementIndex; i < simulationData.length; i++) {
		retiredData.push(simulationData[i]);
	}
	return retiredData;
}

export function createAgeLabels(length: number, startAge: number): number[] {
	const labels: number[] = [];
	for (let i = 0; i < length; i++) {
		labels.push(startAge + i);
	}
	return labels;
}
