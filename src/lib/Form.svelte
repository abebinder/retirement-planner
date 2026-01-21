<script lang="ts">
	import { CurrencyInput } from '@canutin/svelte-currency-input';
	import { type FormValues, defaultFormValues } from './interfaces';
	let { updateParentComponent } = $props();
	
	// State for currency inputs (stored as strings)
	let currentSavings = $state(String(defaultFormValues().initialSavings));
	let annualContribution = $state(String(defaultFormValues().annualContribution));
	let annualRetirementSpend = $state(String(defaultFormValues().annualRetirementSpend));
	
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault(); // Prevent default browser form submission (page reload)
		const form = event.target as HTMLFormElement;
		if (!form) return;
		const formData = new FormData(form);
		const newFormValues: FormValues = {
			initialSavings: Number(currentSavings || 0),
			annualContribution: Number(annualContribution || 0),
			annualRetirementSpend: Number(annualRetirementSpend || 0),
			currentAge: Number(formData.get('current-age') || 0),
			maxRetirementAge: Number(formData.get('max-retirement-age') || 0)
		};
		updateParentComponent(newFormValues);
	}
</script>

<form onsubmit={handleSubmit}>
	<label for="current-savings">Current Savings:</label>
	<CurrencyInput
		bind:value={currentSavings}
		id="current-savings"
		name="current-savings"
		intlConfig={{ locale: 'en-US', currency: 'USD' }}
	/>
	<label for="annual-contribution">Annual Contribution (while working):</label>
	<CurrencyInput
		bind:value={annualContribution}
		id="annual-contribution"
		name="annual-contribution"
		intlConfig={{ locale: 'en-US', currency: 'USD' }}
	/>
	<label for="annual-retirement-spend">Annual Retirement Spend:</label>
	<CurrencyInput
		bind:value={annualRetirementSpend}
		id="annual-retirement-spend"
		name="annual-retirement-spend"
		intlConfig={{ locale: 'en-US', currency: 'USD' }}
	/>
	<label for="current-age">Current Age:</label>
	<input
		value={defaultFormValues().currentAge}
		type="number"
		id="current-age"
		name="current-age"
	/>
	<label for="max-retirement-age">Max Retirement Age:</label>
	<input
		value={defaultFormValues().maxRetirementAge}
		type="number"
		id="max-retirement-age"
		name="max-retirement-age"
	/>
	<input type="submit" value="Submit" />
</form>
