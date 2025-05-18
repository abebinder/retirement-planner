<script lang="ts">
	import { type FormValues, defaultFormValues } from './interfaces';
	let formValues: FormValues = $state(defaultFormValues());
	let { updateParentComponent } = $props();
	$effect(() => updateParentComponent(formValues));
</script>

<label for="current-savings">Current Savings:</label>
<input bind:value={formValues.initialSavings} type="number" id="current-savings" name="current-savings" /><br /><br />
<label for="annual-contribution">Annual Contribution (while working):</label>
<input bind:value={formValues.annualContribution} type="number" id="annual-contribution" name="annual-contribution" /><br /><br />
<label for="annual-retirement-spend">Annual Retirement Spend:</label>
<input bind:value={formValues.annualRetirementSpend} type="number" id="annual-retirement-spend" name="annual-retirement-spend" /><br /><br />
<label for ="current-age">Current Age:</label>
<input bind:value={formValues.currentAge} type="number" id="current-age" name="current-age" /><br /><br />
<label for="max-retirement-age">Max Retirement Age:</label>
<input bind:value={formValues.maxRetirementAge} type="number" id="max-retirement-age" name="max-retirement-age" /><br /><br />

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
