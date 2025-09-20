<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import { currencyFormat } from '$lib/formatter';
	import { calculateRetirementNumber, calculateSavingsByYear, calculateWithdrawlSavingsByYear, calculateYearsToCoast, calculateYearsToRetirement, InvestmentRateMode } from '$lib/calculator';
	import Form from '$lib/Form.svelte';
	import { type FormValues, defaultFormValues } from '$lib/interfaces';
	let formValues: FormValues = $state(defaultFormValues());
	let retirementNumber: number = $derived(calculateRetirementNumber(formValues.annualRetirementSpend));
	let yearsUntilCoast = $derived(
		calculateYearsToCoast( {
			initialSavings: formValues.initialSavings,
			annualContribution: formValues.annualContribution,
			annualRetirementSpend: formValues.annualRetirementSpend,
			currentAge: formValues.currentAge,
			maxRetirementAge: formValues.maxRetirementAge
		}
		)
	);
	let savingsByYear: number[] = $derived(
		calculateSavingsByYear(formValues.initialSavings, formValues.annualContribution, 20, InvestmentRateMode.FIXED)
	);
	let yearsUntilRetirement: number | undefined = $derived(
		calculateYearsToRetirement(savingsByYear, retirementNumber)
	);
	let simulatedSavingsByYear: number[] = $derived(
		calculateSavingsByYear(formValues.initialSavings, formValues.annualContribution, 20, InvestmentRateMode.RANDOM)
	);
	let withdrawlSavingsByYear: number[] = $derived(
		calculateWithdrawlSavingsByYear(formValues.initialSavings, formValues.annualRetirementSpend, InvestmentRateMode.FIXED)
	);
	let randomizedWithdrawlSavingsByYear: number[] = $derived(
		calculateWithdrawlSavingsByYear(formValues.initialSavings, formValues.annualRetirementSpend, InvestmentRateMode.RANDOM)
	);
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

{#if yearsUntilRetirement != undefined}
	<p>You can retire in {yearsUntilRetirement} years.</p>
{:else}
	<p>You can never retire :(</p>
{/if}

{#if yearsUntilCoast != undefined}
	<p>You can coast in {yearsUntilCoast} years.</p>
{:else}
	<p>You can never coast :(</p>
{/if}

<p> You could survive for {withdrawlSavingsByYear.length} years if you retired now. </p>


<h1>Simulations</h1>
<h2>Growth Simulations</h2>
<p> These show what would happen if you kept working and investing indefintely. </p>
<h3>Growth Simulation With Fixed Rate of Return On Investment</h3>
<p>You can retire in {calculateYearsToRetirement(savingsByYear, retirementNumber)} years.</p>
<LineChart
	title="SavingsByYear"
	data={savingsByYear}
	annotationLabel = {{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>

<h3>Growth Simulation With Randomized Rate of Return On Investment</h3>
<p>You can retire in {calculateYearsToRetirement(simulatedSavingsByYear, retirementNumber)} years.</p>

<LineChart
	title="SavingsByYear"
	data={simulatedSavingsByYear}
	annotationLabel={{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>

<h2>Withdrawl Simulations</h2>
<p> This shows what would happen if you stopped working and started withdrawing now. </p>
<h3>Withdrawl Simulation With Fixed Rate Of Return On Investment</h3>
<p> You could survive for {withdrawlSavingsByYear.length} years. </p>
<LineChart
	title="WithdrawlSavingsByYear"
	data={withdrawlSavingsByYear}
	annotationLabel={{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>
<h3>Withdrawl Simulation With Randomized Rate Of Return On Investment</h3>
<p> You could survive for {randomizedWithdrawlSavingsByYear.length} years. </p>
<LineChart
	title="RandomizedWithdrawlSavingsByYear"
	data={randomizedWithdrawlSavingsByYear}
	annotationLabel={{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>