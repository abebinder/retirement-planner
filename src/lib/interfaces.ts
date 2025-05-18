export interface FormValues {
    initialSavings: number;
    annualContribution: number;
    annualRetirementSpend: number;
    currentAge: number;
    maxRetirementAge: number;
}

export function defaultFormValues(): FormValues {
    return {
        initialSavings: 1000000,
        annualContribution: 150000,
        annualRetirementSpend: 65000,
        currentAge: 28,
        maxRetirementAge: 60,
    };

}