<script module lang="ts">
	export interface FormValues {
		initialSavings: number;
		annualContribution: number;
		annualRetirementSpend: number;
		currentAge: number;
		maxRetirementAge: number;
	}

	const DEFAULT_FORM_VALUES: FormValues = {
		initialSavings: 100000,
		annualContribution: 50000,
		annualRetirementSpend: 65000,
		currentAge: 30,
		maxRetirementAge: 70
	};

	export function getFormValues(): FormValues {
		const storedValues = localStorage.getItem('form-values');
		if (storedValues) {
			return JSON.parse(storedValues) as FormValues;
		}
		return DEFAULT_FORM_VALUES;
	}
</script>

<script lang="ts">
	import { CurrencyInput } from '@canutin/svelte-currency-input';

	let { updateParentComponent } = $props();

	// State for inputs
	let currentSavings = $state(String(getFormValues().initialSavings));
	let annualContribution = $state(String(getFormValues().annualContribution));
	let annualRetirementSpend = $state(
		String(getFormValues().annualRetirementSpend)
	);
	let currentAge = $state(String(getFormValues().currentAge));
	let maxRetirementAge = $state(String(getFormValues().maxRetirementAge));

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault(); // Prevent default browser form submission (page reload)
		const form = event.target as HTMLFormElement;
		if (!form) return;
		const formData = new FormData(form);
		const newFormValues: FormValues = {
			initialSavings: Number(currentSavings || 0),
			annualContribution: Number(annualContribution || 0),
			annualRetirementSpend: Number(annualRetirementSpend || 0),
			currentAge: Number(currentAge || 0),
			maxRetirementAge: Number(maxRetirementAge || 0)
		};
		localStorage.setItem('form-values', JSON.stringify(newFormValues));
		updateParentComponent(newFormValues);
	}

	function handleReset() {
		currentSavings = String(DEFAULT_FORM_VALUES.initialSavings);
		annualContribution = String(DEFAULT_FORM_VALUES.annualContribution);
		annualRetirementSpend = String(DEFAULT_FORM_VALUES.annualRetirementSpend);
		currentAge = String(DEFAULT_FORM_VALUES.currentAge);
		maxRetirementAge = String(DEFAULT_FORM_VALUES.maxRetirementAge);
		localStorage.removeItem('form-values');
		updateParentComponent(DEFAULT_FORM_VALUES);
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
		bind:value={currentAge}
		type="number"
		id="current-age"
		name="current-age"
	/>
	<details>
		<summary>Advanced Settings</summary>
		<label for="max-retirement-age">Max Retirement Age:</label>
		<input
			bind:value={maxRetirementAge}
			type="number"
			id="max-retirement-age"
			name="max-retirement-age"
		/>
	</details>
	<input type="submit" value="Submit" />
	<button type="button" class="reset-button" onclick={handleReset}>
		Reset
	</button>
</form>
