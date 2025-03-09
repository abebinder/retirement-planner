<script lang="ts">
let currentSavings : number = $state(0)
let annualContribution : number = $state(0)
let annualRetirementSpend : number = $state(0)

function calculateYearsToRetirement(currentSavings: number, annualContribution: number, annualRetirementSpend: number): number{
    let inflationRate:number = 0.03;
    let investmentRate:number = 0.07;
    //https://www.investopedia.com/terms/f/four-percent-rule.asp
    let retirement_number:number = annualRetirementSpend * 25;
    let savings:number = currentSavings;
    let years:number = 0
    while (savings < retirement_number){
        savings = (savings * (1 + investmentRate)) + annualContribution;
        retirement_number = retirement_number * (1 + inflationRate);
        years++;
        console.log(savings,retirement_number, years)
    }
    return years;
}

</script>

<style>
    /* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>

<label for="current-savings">Current Savings:</label>
<input bind:value={currentSavings} type="number" id="current-savings" name="current-savings"><br><br>
<label for="annual-contribution">Annual Contribution (while working):</label>
<input bind:value={annualContribution} type="number" id="annual-contribution" name="annual-contribution"><br><br>
<label for="annual-retirement-spend">Annual Retirement Spend:</label>
<input bind:value={annualRetirementSpend} type="number" id="annual-retirement-spend" name="annual-retirement-spend"><br><br>

<p> You can retire in {calculateYearsToRetirement(currentSavings, annualContribution, annualRetirementSpend)} years.</p>
