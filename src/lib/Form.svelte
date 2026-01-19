<script lang="ts">
	import { type FormValues, defaultFormValues } from './interfaces';
	let { updateParentComponent } = $props();
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault(); // Prevent default browser form submission (page reload)
		const form = event.target as HTMLFormElement;
		if (!form) return;
		const formData = new FormData(form);
		const newFormValues: FormValues = {
			initialSavings: Number(formData.get('current-savings') || 0),
			annualContribution: Number(formData.get('annual-contribution') || 0),
			annualRetirementSpend: Number(formData.get('annual-retirement-spend') || 0),
			currentAge: Number(formData.get('current-age') || 0),
			maxRetirementAge: Number(formData.get('max-retirement-age') || 0)
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
	/>
	<label for="annual-contribution">Annual Contribution (while working):</label>
	<input
		value={defaultFormValues().annualContribution}
		type="number"
		id="annual-contribution"
		name="annual-contribution"
	/>
	<label for="annual-retirement-spend">Annual Retirement Spend:</label>
	<input
		value={defaultFormValues().annualRetirementSpend}
		type="number"
		id="annual-retirement-spend"
		name="annual-retirement-spend"
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
