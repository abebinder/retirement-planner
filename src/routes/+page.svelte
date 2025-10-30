<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import { currencyFormat } from '$lib/formatter';
	import { ThresholdComprator, type SimulationStats } from '$lib/calculator';
	import {
		calculateRetirementNumber,
		calculateSavingsByYear,
		calculateYearsToCoast,
		InvestmentRateMode,
		calculateSimulationStatsForWithdrawl,
		runMultipleSimulations
	} from '$lib/calculator';
	import Form from '$lib/Form.svelte';
	import { type FormValues, defaultFormValues } from '$lib/interfaces';

	const MAX_ITERATIONS: number = 100;
	const NUM_SIMULATIONS: number = 10;

	let formValues: FormValues = $state(defaultFormValues());
	let retirementNumber: number = $derived(calculateRetirementNumber(formValues.annualRetirementSpend));
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
	let simulatedSavingsByYear: number[] = $derived(
		calculateSavingsByYear(
			formValues.initialSavings,
			formValues.annualContribution,
			MAX_ITERATIONS,
			InvestmentRateMode.RANDOM,
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
	let simulationStatsForWithdrawl: SimulationStats = $derived(calculateSimulationStatsForWithdrawl(randomizedWithdrawlSimulations));
	function updateFormValues(newFormValues: FormValues) {
		formValues = newFormValues;
	}
</script>

<svelte:head>
	<title>Retirement Calculator</title>
	<meta name="description" content="Use this calculator to figure out when you can retire." />
</svelte:head>

<h1>Input</h1>
<Form updateParentComponent={updateFormValues}></Form>

<h1>Summary</h1>
<p>Retirement number is {currencyFormat(retirementNumber)}.</p>

<p>You can retire in {savingsByYear.length - 1} years.</p>

<p>You can coast in {yearsUntilCoast} years.</p>

<p>You could survive for {withdrawlSavingsByYear.length - 1} years if you retired now.</p>

<h1>Simulations</h1>
<h2>Growth Simulations</h2>
<p>These show how long it takes to hit your retirement number.</p>
<h3>Growth Simulation With Fixed Rate of Return On Investment</h3>
<p>You can retire in {savingsByYear.length - 1} years.</p>
<LineChart
	title="SavingsByYear"
	data={savingsByYear}
	annotationLabel={{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>

<h3>Growth Simulation With Randomized Rate of Return On Investment</h3>
<p>You can retire in {simulatedSavingsByYear.length - 1} years.</p>

<LineChart
	title="SavingsByYear"
	data={simulatedSavingsByYear}
	annotationLabel={{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>

<h2>Withdrawl Simulations</h2>
<p>This shows what would happen if you stopped working and started withdrawing now.</p>
<h3>Withdrawl Simulation With Fixed Rate Of Return On Investment</h3>
<p>You could survive for {withdrawlSavingsByYear.length - 1} years.</p>
<LineChart
	title="WithdrawlSavingsByYear"
	data={withdrawlSavingsByYear}
	annotationLabel={{
		content: 'Annual Retirement Spend: ' + currencyFormat(formValues.annualRetirementSpend),
		value: formValues.annualRetirementSpend
	}}
></LineChart>
<h3>Withdrawl Simulation With Randomized Rate Of Return On Investment</h3>
<p>
	Here are the stats for how long you could survive if you started withdrawing now (in years) over {randomizedWithdrawlSimulations.length} simulations.
</p>
<pre> {JSON.stringify(simulationStatsForWithdrawl, null, 2)} </pre>
{#each randomizedWithdrawlSimulations as randomizedWithdrawlSavingsByYear, i}
	<h4>Simulation {i + 1}</h4>
	<p>You could survive for {randomizedWithdrawlSavingsByYear.length - 1} years.</p>
	<LineChart
		title="RandomizedWithdrawlSavingsByYear"
		data={randomizedWithdrawlSavingsByYear}
		annotationLabel={{
			content: 'Annual Retirement Spend: ' + currencyFormat(formValues.annualRetirementSpend),
			value: formValues.annualRetirementSpend
		}}
	></LineChart>
{/each}
