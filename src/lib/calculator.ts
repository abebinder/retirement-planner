
export function calculateRetirementNumber(annualRetirementSpend: number) {
    //https://www.investopedia.com/terms/f/four-percent-rule.asp
    return annualRetirementSpend * 25;
}

export function calculateSavingsByYear(initialSavings: number, annualContribution: number, years: number): number[] {
    const investmentRate: number = 0.07;
    let savingsByYear: number[] = [];
    let savings = initialSavings;
    for (let i = 0; i < years + 1; i++) {
        savingsByYear.push(savings);
        savings = savings * (1 + investmentRate) + annualContribution;
    }
    return savingsByYear;
}

export function calculateYearsToRetirement(initialSavings: number, annualContribution: number, retirement_number: number): number | undefined {
    const savingsByYear: number[] = calculateSavingsByYear(initialSavings, annualContribution, 50);
    for (let i = 0; i < savingsByYear.length; i++) {
        if (savingsByYear[i] > retirement_number) {
            return i;
        }
    }
}