<script lang="ts">
	import { type FormValues, defaultFormValues } from './interfaces';
	let { updateParentComponent } = $props();
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault(); // Prevent default browser form submission (page reload)
		const newFormValues: FormValues = {
			initialSavings: Number(event.target[0].value),
			annualContribution: Number(event.target[1].value),
			annualRetirementSpend: Number(event.target[2].value),
			currentAge: Number(event.target[3].value),
			maxRetirementAge: Number(event.target[4].value)
		};
		updateParentComponent(newFormValues);
	}
</script>

<form onsubmit={handleSubmit}>
	<label for="current-savings">Current Savings:</label>
	<input
		value={defaultFormValues().initialSavings}
		type="number"
		id="current-savings"
		name="current-savings"
	/><br /><br />
	<label for="annual-contribution">Annual Contribution (while working):</label>
	<input
		value={defaultFormValues().annualContribution}
		type="number"
		id="annual-contribution"
		name="annual-contribution"
	/><br /><br />
	<label for="annual-retirement-spend">Annual Retirement Spend:</label>
	<input
		value={defaultFormValues().annualRetirementSpend}
		type="number"
		id="annual-retirement-spend"
		name="annual-retirement-spend"
	/><br /><br />
	<label for="current-age">Current Age:</label>
	<input
		value={defaultFormValues().currentAge}
		type="number"
		id="current-age"
		name="current-age"
	/><br /><br />
	<label for="max-retirement-age">Max Retirement Age:</label>
	<input
		value={defaultFormValues().maxRetirementAge}
		type="number"
		id="max-retirement-age"
		name="max-retirement-age"
	/><br /><br />
	<input type="submit" value="Submit" />
</form>

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
