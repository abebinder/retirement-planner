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
	let yearsUntilRetirement: number | undefined = $derived(
		calculateYearsToRetirement(formValues.initialSavings, formValues.annualContribution, retirementNumber)
	);
	let savingsByYear: number[] = $derived(
		calculateSavingsByYear(formValues.initialSavings, formValues.annualContribution, 20, InvestmentRateMode.FIXED)
	);
	let simulatedSavingsByYear: number[] = $derived(
		calculateSavingsByYear(formValues.initialSavings, formValues.annualContribution, 20, InvestmentRateMode.RANDOM)
	);
	let withdrawlSavingsByYear: number[] = $derived(
		calculateWithdrawlSavingsByYear(formValues.initialSavings, formValues.annualRetirementSpend)
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
<p> These show what would happen if you kept investing indefintely. </p>
<h3>Growth Simulation With Fixed Investment Rate</h3>
<LineChart
	title="SavingsByYear"
	data={savingsByYear}
	annotationLabel = {{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>

<h3>Growth Simulation With Variable Randomized Investment Rate</h3>

<LineChart
	title="SavingsByYear"
	data={simulatedSavingsByYear}
	annotationLabel={{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>

<h2>Withdrawl Simulations</h2>
<p> This shows what would happen if you started withdrawing now. </p>
<h3>Withdrawl Simulation With Fixed Investment Rate</h3>
<p> You could survive for {withdrawlSavingsByYear.length} years. </p>
<LineChart
	title="WithdrawlSavingsByYear"
	data={withdrawlSavingsByYear}
	annotationLabel={{
		content: 'Retirement Number: ' + currencyFormat(retirementNumber),
		value: retirementNumber
	}}
></LineChart>