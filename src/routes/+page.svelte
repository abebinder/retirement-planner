<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	import { currencyFormat } from '$lib/formatter';
	import { calculateRetirementNumber, calculateSavingsByYear, calculateYearsToRetirement } from '$lib/calculator';
	let initialSavings: number = $state(1000000);
	let annualContribution: number = $state(150000);
	let annualRetirementSpend: number = $state(65000);
	let retirementNumber: number = $derived(calculateRetirementNumber(annualRetirementSpend));
	let yearsUntilRetirement: number | undefined = $derived(calculateYearsToRetirement(initialSavings, annualContribution, retirementNumber));
	let savingsByYear: number[] = $derived(calculateSavingsByYear(initialSavings, annualContribution, 20));
</script>

<svelte:head>
	<title>Retirement Calculator</title>
	<meta name="description" content="Use this calculator to figure out when you can retire." />
</svelte:head>

<label for="current-savings">Current Savings:</label>
<input bind:value={initialSavings} type="number" id="current-savings" name="current-savings" /><br /><br />
<label for="annual-contribution">Annual Contribution (while working):</label>
<input bind:value={annualContribution} type="number" id="annual-contribution" name="annual-contribution" /><br /><br />
<label for="annual-retirement-spend">Annual Retirement Spend:</label>
<input bind:value={annualRetirementSpend} type="number" id="annual-retirement-spend" name="annual-retirement-spend" /><br /><br />

<p>Retirement number is {currencyFormat(retirementNumber)}.</p>

{#if yearsUntilRetirement}
	<p>You can retire in {yearsUntilRetirement} years.</p>
{:else}
	<p>You can never retire :(</p>
{/if}

<LineChart
	title="SavingsByYear"
	data={savingsByYear}
	annotationLabelContent={'Retirement Number: ' + currencyFormat(retirementNumber)}
	annotationLabelValue={retirementNumber}
></LineChart>

<style>
	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
