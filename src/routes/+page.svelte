<script lang="ts">
	let initialSavings: number = $state(1000000);
	let annualContribution: number = $state(150000);
	let annualRetirementSpend: number = $state(65000);
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
		//https://www.investopedia.com/terms/f/four-percent-rule.asp
		const retirement_number: number = annualRetirementSpend * 25;
		console.log('Retirement number is ', retirement_number);
		let savingsByYear: number[] = [];
		let savings = initialSavings;
		let yearsUntilRetirement: number = 0;
		for (let i = 0; i < 50; i++) {
			savingsByYear.push(savings);
			if (savings < retirement_number) {
				yearsUntilRetirement++;
			}
			savings = savings * (1 + investmentRate) + annualContribution;
			console.log(yearsUntilRetirement, savings);
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

<p>You can retire in {simulationResult.yearsUntilRetirement} years.</p>

<table>
	<tbody>
		<tr>
			<th>Year</th>
			<th>Savings</th>
		</tr>
		{#each simulationResult.savingsByYear as savings, year}
			<tr>
				<th> {year} </th>
				<th> {formatter.format(savings)}</th>
			</tr>
		{/each}
	</tbody>
</table>

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
