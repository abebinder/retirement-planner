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
	let withdrawlSavingsByYear: number[] = $derived(
		calculateSavingsByYear(
			formValues.initialSavings,
			-formValues.annualRetirementSpend,
			MAX_ITERATIONS,
			InvestmentRateMode.FIXED,
			formValues.annualRetirementSpend,
			ThresholdComprator.LESS_THAN
		)
	);
	let randomizedWithdrawlSimulations: number[][] = $derived(
		runMultipleSimulations(
			formValues.initialSavings,
			-formValues.annualRetirementSpend,
			NUM_SIMULATIONS,
			formValues.annualRetirementSpend,
			ThresholdComprator.LESS_THAN
		)
	);
	let simulationStatsForWithdrawl: SimulationStats = $derived(
		calculateSimulationStats(randomizedWithdrawlSimulations)
	);
	function updateFormValues(newFormValues: FormValues) {
		formValues = newFormValues;
	}
	let randomizedGrowthSimulations: number[][] = $derived(
		runMultipleSimulations(
			formValues.initialSavings,
			formValues.annualContribution,
			NUM_SIMULATIONS,
			retirementNumber,
			ThresholdComprator.GREATER_THAN
		)
	);
	let simulationStatsForGrowth: SimulationStats = $derived(
		calculateSimulationStats(randomizedGrowthSimulations)
	);
	let growthAndWithdrawlResults: MultipleGrowthCombinedWithWithdrawlSimulationResult[] = $derived(
		runGrowthAndWithdrawlForEachAge(
			formValues.initialSavings,
			formValues.annualContribution,
			formValues.annualRetirementSpend,
			NUM_SIMULATIONS,
			formValues.currentAge,
			formValues.maxRetirementAge
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
	<p>Retirement number is <strong>{currencyFormat(retirementNumber)}</strong>.</p>
	<p>You can retire in <strong>{savingsByYear.length - 1} years</strong>.</p>
	<p>You can coast in <strong>{yearsUntilCoast} years</strong>.</p>
	<p>
		You could survive for <strong>{withdrawlSavingsByYear.length - 1} years</strong> if you retired
		now.
	</p>
</section>

<section class="panel">
	<h1>Simulations</h1>
	<h2>Growth and Withdrawl Simulations</h2>
	<p>These show the percentage chance you could survive at each age.</p>
	<div class="panel">
			{#each growthAndWithdrawlResults as result, i}
				<h4>Age {i + formValues.currentAge}</h4>
				<p>You have a {result.successRate * 100}% chance of surviving.</p>
			{/each}
	</div>
	<h2>Growth Simulations</h2>
	<p>These show how long it takes to hit your retirement number.</p>
	
	<div class="panel">
		<h3>Growth Simulation With Fixed Rate of Return On Investment</h3>
		<p>You can retire in <strong>{savingsByYear.length - 1} years</strong>.</p>
		<LineChart
			title="SavingsByYear"
			data={savingsByYear}
			annotationLabel={{
				content: 'Retirement Number: ' + currencyFormat(retirementNumber),
				value: retirementNumber
			}}
		></LineChart>
	</div>

	<div class="panel">
		<h3>Growth Simulation With Randomized Rate of Return On Investment</h3>
		<p>
			Here are the stats for how long it would take to get to your retirement number
			over {randomizedGrowthSimulations.length} simulations.
		</p>
		<pre> {JSON.stringify(simulationStatsForGrowth, null, 2)} </pre>
		<details>
			<summary>View All Randomized Growth Simulations</summary>
			{#each randomizedGrowthSimulations as randomizedGrowthSavingsByYear, i}
				<div style="margin-top: 1.5rem;">
					<h4>Simulation {i + 1}</h4>
					<p>
						It would take you {randomizedGrowthSavingsByYear.length - 1} years to retire.
					</p>
					<LineChart
						title="RandomizedGrowthSavingsByYear"
						data={randomizedGrowthSavingsByYear}
						annotationLabel={{
							content: 'Retirement Number: ' + currencyFormat(retirementNumber),
							value: retirementNumber
						}}
					></LineChart>
				</div>
			{/each}
		</details>
	</div>

	<h2>Withdrawl Simulations</h2>
	<p>
		This shows what would happen if you stopped working and started withdrawing
		now.
	</p>
	
	<div class="panel">
		<h3>Withdrawl Simulation With Fixed Rate Of Return On Investment</h3>
		<p>You could survive for <strong>{withdrawlSavingsByYear.length - 1} years</strong>.</p>
		<LineChart
			title="WithdrawlSavingsByYear"
			data={withdrawlSavingsByYear}
			annotationLabel={{
				content:
					'Annual Retirement Spend: ' +
					currencyFormat(formValues.annualRetirementSpend),
				value: formValues.annualRetirementSpend
			}}
		></LineChart>
	</div>
	
	<div class="panel">
		<h3>Withdrawl Simulation With Randomized Rate Of Return On Investment</h3>
		<p>
			Here are the stats for how long you could survive if you started withdrawing
			now (in years) over {randomizedWithdrawlSimulations.length} simulations.
		</p>
		<pre> {JSON.stringify(simulationStatsForWithdrawl, null, 2)} </pre>
		<details>
			<summary>View All Randomized Withdrawl Simulations</summary>
			{#each randomizedWithdrawlSimulations as randomizedWithdrawlSavingsByYear, i}
				<div style="margin-top: 1.5rem;">
					<h4>Simulation {i + 1}</h4>
					<p>
						You could survive for {randomizedWithdrawlSavingsByYear.length - 1} years.
					</p>
					<LineChart
						title="RandomizedWithdrawlSavingsByYear"
						data={randomizedWithdrawlSavingsByYear}
						annotationLabel={{
							content:
								'Annual Retirement Spend: ' +
								currencyFormat(formValues.annualRetirementSpend),
							value: formValues.annualRetirementSpend
						}}
					></LineChart>
				</div>
			{/each}
		</details>
	</div>
</section>
