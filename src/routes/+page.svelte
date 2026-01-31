<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import { type RunMultipleSimulationsResult } from '$lib/simulator';
	import {
		runMultipleSimulationsForEachAge,
		calculateRetirementAge
	} from '$lib/simulator';
	import { NUM_SIMULATIONS } from '$lib/constants';
	import Form, { type FormValues, getFormValues } from '$lib/Form.svelte';
	import { currencyFormat, percentageFormat } from '$lib/formatter';
	import {
		computeConfidenceByAge,
		createConfidenceDataset,
		computeWorkingData,
		computeRetiredData,
		createAgeLabels
	} from '$lib/dataTransformer';

	let formValues: FormValues = $state(getFormValues());
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
			formValues.maxRetirementAge,
			formValues.lifeExpectancy
		)
	);
	let confidentRetirementAge = $derived(
		calculateRetirementAge(
			growthAndWithdrawlResults,
			formValues.currentAge,
			formValues.retirementAgeConfidence / 100
		)
	);

	let confidenceByAge = $derived(
		computeConfidenceByAge(growthAndWithdrawlResults, formValues.currentAge)
	);

	let confidenceDataset = $derived(
		createConfidenceDataset(confidenceByAge.successRates)
	);
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
		Retirement Age (With {formValues.retirementAgeConfidence}% Simulations
		Surviving til Age {formValues.lifeExpectancy}):
		<strong>
			{#if confidentRetirementAge !== null}
				{confidentRetirementAge}
			{:else}
				Not achievable
			{/if}
		</strong>.
	</p>
	<LineChart
		title="Simulation Success Rate by Retirement Age"
		xLabels={confidenceByAge.ages}
		datasets={confidenceDataset}
		xAxisLabel="Retirement Age"
		formatter={percentageFormat}
	></LineChart>
</section>

<section class="panel">
	<h1>Simulations</h1>
	<p>
		{NUM_SIMULATIONS} simulations with different market conditions are run at each
		age. The results show the percentage chance your retirement savings would last
		til age {formValues.lifeExpectancy} if you retired at the given age.
	</p>
	{#each growthAndWithdrawlResults as result, i}
		<h2>Age {i + formValues.currentAge}</h2>
		<p>
			You have a {percentageFormat(result.successRate)} chance of surviving to age
			{formValues.lifeExpectancy}
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
							label: 'Working (Contributing)'
						},
						{
							data: retiredData,
							label: 'Retired (Withdrawing)'
						}
					]}
					xAxisLabel="Age"
					formatter={currencyFormat}
				></LineChart>
			{/each}
		</details>
	{/each}
</section>
