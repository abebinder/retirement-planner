<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import { type RunMultipleSimulationsResult } from '$lib/simulator';
	import {
		runMultipleSimulationsForEachAge,
		calculateRetirementAge
	} from '$lib/simulator';
	import {
		LIFE_EXPECTANCY,
		NUM_SIMULATIONS,
		RETIREMENT_AGE_CONFIDENCE
	} from '$lib/constants';
	import Form, { type FormValues, defaultFormValues } from '$lib/Form.svelte';
	import { currencyFormat, percentageFormat } from '$lib/formatter';

	let formValues: FormValues = $state(defaultFormValues());
	function updateFormValues(newFormValues: FormValues) {
		formValues = newFormValues;
	}
	let growthAndWithdrawlResults: RunMultipleSimulationsResult[] = $derived(
		runMultipleSimulationsForEachAge(
			formValues.initialSavings,
			formValues.annualContribution,
			formValues.annualRetirementSpend,
			NUM_SIMULATIONS,
			formValues.currentAge,
			formValues.maxRetirementAge
		)
	);
	let confidentRetirementAge = $derived(
		calculateRetirementAge(
			growthAndWithdrawlResults,
			formValues.currentAge,
			RETIREMENT_AGE_CONFIDENCE
		)
	);

	// Data for confidence by age chart
	function computeConfidenceByAge(results: RunMultipleSimulationsResult[]): {
		ages: number[];
		successRates: number[];
	} {
		const ages: number[] = [];
		const successRates: number[] = [];
		for (let i = 0; i < results.length; i++) {
			ages.push(formValues.currentAge + i);
			successRates.push(results[i].successRate);
		}
		return { ages, successRates };
	}

	let confidenceByAge = $derived(
		computeConfidenceByAge(growthAndWithdrawlResults)
	);

	// Dataset for confidence chart
	function createConfidenceDataset(successRates: number[]) {
		return [
			{
				data: successRates,
				label: 'Success Rate',
				formatter: percentageFormat,
				yMax: 1
			}
		];
	}

	let confidenceDataset = $derived(
		createConfidenceDataset(confidenceByAge.successRates)
	);

	// Calculate working data for a single simulation
	function computeWorkingData(
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
	function computeRetiredData(
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

	function createAgeLabels(length: number, startAge: number): number[] {
		const labels: number[] = [];
		for (let i = 0; i < length; i++) {
			labels.push(startAge + i);
		}
		return labels;
	}
</script>

<svelte:head>
	<title>Fi Simulator</title>
	<meta
		name="description"
		content="Use this simulator to figure out when you can retire."
	/>
</svelte:head>

<section class="panel">
	<h1>Input</h1>
	<Form updateParentComponent={updateFormValues}></Form>
</section>

<section class="panel">
	<h1>Summary</h1>
	<p>
		Retirement Age (With {RETIREMENT_AGE_CONFIDENCE * 100}% Confidence of
		Savings Surviving til Age {LIFE_EXPECTANCY}):
		<strong>
			{#if confidentRetirementAge !== null}
				{confidentRetirementAge}
			{:else}
				Not achievable
			{/if}
		</strong>.
	</p>
	<LineChart
		title="Retirement Confidence by Age"
		xLabels={confidenceByAge.ages}
		datasets={confidenceDataset}
		yMax={1}
		yMin={0}
		xAxisLabel="Retirement Age"
	></LineChart>
</section>

<section class="panel">
	<h1>Simulations</h1>
	<p>
		{NUM_SIMULATIONS} simulations with different market conditions are run at each
		age. The results show the percentage chance your retirement savings would last
		til age {LIFE_EXPECTANCY} if you retired at the given age.
	</p>
	{#each growthAndWithdrawlResults as result, i}
		<h2>Age {i + formValues.currentAge}</h2>
		<p>
			You have a {result.successRate * 100}% chance of surviving to age {LIFE_EXPECTANCY}
			if you retired at age {i + formValues.currentAge}.
		</p>
		<details>
			<summary>View A Few Simulations</summary>
			{#each result.sampleSimulations as simulation, j}
				{@const retirementAge = i + formValues.currentAge}
				{@const retirementIndex = retirementAge - formValues.currentAge}
				{@const workingData = computeWorkingData(
					simulation.simulationData,
					retirementIndex
				)}
				{@const retiredData = computeRetiredData(
					simulation.simulationData,
					retirementIndex
				)}
				<LineChart
					title={simulation.simulationTitle}
					xLabels={createAgeLabels(
						simulation.simulationData.length,
						formValues.currentAge
					)}
					datasets={[
						{
							data: workingData,
							label: 'Working (Contributing)',
							formatter: currencyFormat
						},
						{
							data: retiredData,
							label: 'Retired (Withdrawing)',
							formatter: currencyFormat
						}
					]}
					xAxisLabel="Age"
				></LineChart>
			{/each}
		</details>
	{/each}
</section>
