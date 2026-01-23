<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import { currencyFormat } from '$lib/formatter';
	import { ThresholdComprator, type SimulationStats, type MultipleGrowthCombinedWithWithdrawlSimulationResult } from '$lib/calculator';
	import {
		calculateRetirementNumber,
		calculateSavingsByYear,
		calculateYearsToCoast,
		InvestmentRateMode,
		calculateSimulationStats,
		runMultipleSimulations,
		runGrowthAndWithdrawlForEachAge,
		calculateRetirementAge,
	} from '$lib/calculator';
	import Form from '$lib/Form.svelte';
	import { type FormValues, defaultFormValues } from '$lib/interfaces';

	const MAX_ITERATIONS: number = 100;
	const NUM_SIMULATIONS: number = 100;

	let formValues: FormValues = $state(defaultFormValues());
	let retirementNumber: number = $derived(
		calculateRetirementNumber(formValues.annualRetirementSpend)
	);
	let yearsUntilCoast = $derived(
		calculateYearsToCoast({
			initialSavings: formValues.initialSavings,
			annualContribution: formValues.annualContribution,
			annualRetirementSpend: formValues.annualRetirementSpend,
			currentAge: formValues.currentAge,
			maxRetirementAge: formValues.maxRetirementAge
		})
	);
	let savingsByYear: number[] = $derived(
		calculateSavingsByYear(
			formValues.initialSavings,
			formValues.annualContribution,
			MAX_ITERATIONS,
			InvestmentRateMode.FIXED,
			retirementNumber,
			ThresholdComprator.GREATER_THAN
		)
	);
	function updateFormValues(newFormValues: FormValues) {
		formValues = newFormValues;
	}
	let growthAndWithdrawlResults: MultipleGrowthCombinedWithWithdrawlSimulationResult[] = $derived(
		runGrowthAndWithdrawlForEachAge(
			formValues.initialSavings,
			formValues.annualContribution,
			formValues.annualRetirementSpend,
			1000,
			formValues.currentAge,
			formValues.maxRetirementAge
		)
	);
	let earliestRetirementAge95Confidence = $derived(
		calculateRetirementAge(growthAndWithdrawlResults, formValues.currentAge, 0.95)
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
	<p>Retirement number is <strong>{currencyFormat(retirementNumber)}</strong>.</p>
	<p>You can retire in <strong>{savingsByYear.length - 1} years</strong>.</p>
	<p>You can coast in <strong>{yearsUntilCoast} years</strong>.</p>
	<p>Retirement Age (95% Confidence of Savings Surviving to Age 90): <strong>{earliestRetirementAge95Confidence ?? 'Not achievable'}</strong>.</p>
</section>

<section class="panel">
	<h1>Simulations</h1>
	<p>1000 simulations with different market conditions are run at each age. 
		The results show the percentage chance your retirement savings would last til age 90 if you retired at the given age.</p>
			{#each growthAndWithdrawlResults as result, i}
				<h2>Age {i + formValues.currentAge}</h2>
				<p>You have a {result.successRate * 100}% chance of surviving to age 90 if you retired at age {i + formValues.currentAge}.</p>
				<details>
					<summary>View A Few Simulations</summary>
					<LineChart
						title="0th Percentile Simulation (Worst Case Scenario)"
						data={result.p0_simulation}
						currentAge={formValues.currentAge}
						retirementAge={i + formValues.currentAge}
					></LineChart>
					<LineChart
						title="10th Percentile Simulation (Very Bad Scenario)"
						data={result.p10_simulation}
						currentAge={formValues.currentAge}
						retirementAge={i + formValues.currentAge}
					></LineChart>
					<LineChart
						title="50th Percentile Simulation (Median Scenario)"
						data={result.p50_simulation}
						currentAge={formValues.currentAge}
						retirementAge={i + formValues.currentAge}
					></LineChart>
					<LineChart
						title="90th Percentile Simulation (Very Good Scenario)"
						data={result.p90_simulation}
						currentAge={formValues.currentAge}
						retirementAge={i + formValues.currentAge}
					></LineChart>
					<LineChart
						title="100th Percentile Simulation (Best Case Scenario)"
						data={result.p100_simulation}
						currentAge={formValues.currentAge}
						retirementAge={i + formValues.currentAge}
					></LineChart>
				</details>
			{/each}
</section>
