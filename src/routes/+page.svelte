<script lang="ts">
	import LineChart from '$lib/LineChart.svelte';
	let initialSavings: number = $state(1000000);
	let annualContribution: number = $state(150000);
	let annualRetirementSpend: number = $state(65000);
	//https://www.investopedia.com/terms/f/four-percent-rule.asp
	let retirementNumber: number = $derived(25 * annualRetirementSpend);
	let simulationResult: SimulationResult = $derived.by(calculateYearsToRetirement);

	// Create our number formatter.
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	interface SimulationResult {
		savingsByYear: number[];
		yearsUntilRetirement: number;
	}

	function calculateYearsToRetirement(): SimulationResult {
		const investmentRate: number = 0.07;
		let savingsByYear: number[] = [];
		let savings = initialSavings;
		let yearsUntilRetirement: number = 0;
		for (let i = 0; i < 21; i++) {
			savingsByYear.push(savings);
			if (savings < retirementNumber) {
				yearsUntilRetirement++;
			}
			savings = savings * (1 + investmentRate) + annualContribution;
		}
		return {
			savingsByYear: savingsByYear,
			yearsUntilRetirement: yearsUntilRetirement
		};
	}
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

<p>Retirement number is {formatter.format(retirementNumber)}.</p>

<p>You can retire in {simulationResult.yearsUntilRetirement} years.</p>

<LineChart
	title="SavingsByYear"
	data={simulationResult.savingsByYear}
	annotationLabelContent={'Retirement Number: ' + formatter.format(retirementNumber)}
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
