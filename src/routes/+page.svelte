<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import { currencyFormat } from '$lib/formatter';
	import { calculateRetirementNumber, calculateSavingsByYear, calculateYearsToRetirement, InvestmentRateMode } from '$lib/calculator';
	import Form from '$lib/Form.svelte';
	import { type FormValues, defaultFormValues } from '$lib/interfaces';
	let formValues: FormValues = $state(defaultFormValues());
	let retirementNumber: number = $derived(calculateRetirementNumber(formValues.annualRetirementSpend));
	let yearsUntilRetirement: number | undefined = $derived(
		calculateYearsToRetirement(formValues.initialSavings, formValues.annualContribution, retirementNumber)
	);
	let savingsByYear: number[] = $derived(
		calculateSavingsByYear(formValues.initialSavings, formValues.annualContribution, 20, InvestmentRateMode.FIXED)
	);
	let simulatedSavingsByYear: number[] = $derived(
		calculateSavingsByYear(formValues.initialSavings, formValues.annualContribution, 20, InvestmentRateMode.RANDOM)
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

<h1>Simulations</h1>
<h2>Simulation With Fixed Investment Rate</h2>
<LineChart
	title="SavingsByYear"
	data={savingsByYear}
	annotationLabelContent={'Retirement Number: ' + currencyFormat(retirementNumber)}
	annotationLabelValue={retirementNumber}
></LineChart>

<h2>Simulation With Variable Randomized Investment Rate</h2>

<LineChart
	title="SavingsByYear"
	data={simulatedSavingsByYear}
	annotationLabelContent={'Retirement Number: ' + currencyFormat(retirementNumber)}
	annotationLabelValue={retirementNumber}
></LineChart>
