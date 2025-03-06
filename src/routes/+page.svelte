<script lang="ts">
let currentSavings : number = $state(0)
let annualContribution : number = $state(0)
let annualRetirementSpend : number = $state(0)

function calculateYearsToRetirement(currentSavings: number, annualContribution: number, annualRetirementSpend: number): number{
    //https://www.investopedia.com/terms/f/four-percent-rule.asp
    let retirement_number:number = annualRetirementSpend * 25;
    let remaining:number = retirement_number - currentSavings;
    if (remaining <= 0) {
       return 0;
    }
    return remaining/annualContribution;
}

</script>

<label for="current-savings">Current Savings:</label>
<input bind:value={currentSavings} type="text" id="current-savings" name="current-savings"><br><br>
<label for="annual-contribution">Annual Contribution (while working):</label>
<input bind:value={annualContribution} type="text" id="annual-contribution" name="annual-contribution"><br><br>
<label for="annual-retirement-spend">Annual Retirement Spend:</label>
<input bind:value={annualRetirementSpend} type="text" id="annual-retirement-spend" name="annual-retirement-spend"><br><br>

<p> You can retire in {calculateYearsToRetirement(currentSavings, annualContribution, annualRetirementSpend)} years.</p>