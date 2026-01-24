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
	let confidenceByAge = $derived({
		ages: growthAndWithdrawlResults.map((_, i) => formValues.currentAge + i),
		successRates: growthAndWithdrawlResults.map((result) => result.successRate)
	});

	// Dataset for confidence chart
	let confidenceDataset = $derived([
		{
			data: confidenceByAge.successRates,
			label: 'Success Rate',
			formatter: percentageFormat,
			yMax: 1
		}
	]);
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
		<strong>{confidentRetirementAge ?? 'Not achievable'}</strong>.
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
			{#each result.sampleSimulations as simulation}
				{@const retirementAge = i + formValues.currentAge}
				{@const retirementIndex = retirementAge - formValues.currentAge}
				{@const workingData = [
					...simulation.simulationData.slice(0, retirementIndex + 1),
					...new Array(
						simulation.simulationData.length - retirementIndex - 1
					).fill(null)
				]}
				{@const retiredData = [
					...new Array(retirementIndex).fill(null),
					...simulation.simulationData.slice(retirementIndex)
				]}
				<LineChart
					title={simulation.simulationTitle}
					xLabels={Array.from(
						{ length: simulation.simulationData.length },
						(_, j) => formValues.currentAge + j
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
