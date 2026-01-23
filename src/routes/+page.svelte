<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import {
		type RunMultipleSimulationsResult
	} from '$lib/calculator';
	import {
		runMultipleSimulationsForEachAge,
		calculateRetirementAge
	} from '$lib/calculator';
	import Form from '$lib/Form.svelte';
	import { type FormValues, defaultFormValues } from '$lib/interfaces';

	let formValues: FormValues = $state(defaultFormValues());
	function updateFormValues(newFormValues: FormValues) {
		formValues = newFormValues;
	}
	let growthAndWithdrawlResults: RunMultipleSimulationsResult[] =
		$derived(
			runMultipleSimulationsForEachAge(
				formValues.initialSavings,
				formValues.annualContribution,
				formValues.annualRetirementSpend,
				1000,
				formValues.currentAge,
				formValues.maxRetirementAge
			)
		);
	let earliestRetirementAge95Confidence = $derived(
		calculateRetirementAge(
			growthAndWithdrawlResults,
			formValues.currentAge,
			0.95
		)
	);
</script>

<svelte:head>
	<title>Retirement Calculator</title>
	<meta
		name="description"
		content="Use this calculator to figure out when you can retire."
	/>
</svelte:head>

<section class="panel">
	<h1>Input</h1>
	<Form updateParentComponent={updateFormValues}></Form>
</section>

<section class="panel">
	<h1>Summary</h1>
	<p>
		Retirement Age (With 95% Confidence of Savings Surviving til Age 90): <strong
			>{earliestRetirementAge95Confidence ?? 'Not achievable'}</strong
		>.
	</p>
</section>

<section class="panel">
	<h1>Simulations</h1>
	<p>
		1000 simulations with different market conditions are run at each age. The
		results show the percentage chance your retirement savings would last til
		age 90 if you retired at the given age.
	</p>
	{#each growthAndWithdrawlResults as result, i}
		<h2>Age {i + formValues.currentAge}</h2>
		<p>
			You have a {result.successRate * 100}% chance of surviving to age 90 if
			you retired at age {i + formValues.currentAge}.
		</p>
		<details>
			<summary>View A Few Simulations</summary>
			{#each result.simulations as simulation}
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
