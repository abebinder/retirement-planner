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
				<LineChart
					title={simulation.simulationTitle}
					data={simulation.simulationData}
					currentAge={formValues.currentAge}
					retirementAge={i + formValues.currentAge}
				></LineChart>
			{/each}
		</details>
	{/each}
</section>
