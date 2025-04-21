import annualReturnData from './sp_annual_returns.json'

import {quantileSeq, type MathArray} from 'mathjs'

const spReturnPercentiles: number[] = generateSpReturnPercentiles();

function getRandomInt(max:number): number {
    return Math.floor(Math.random() * max);
  }

export function randomYearlyPercentReturn(): number {
    const randomPercent = spReturnPercentiles.at(getRandomInt(100)) as number;
    return randomPercent/100;
}

export function generateSpReturnPercentiles(): number[] {
    let spReturnsByYear:number[] = []
    for (const e of annualReturnData) {
        //TODO: Make inflation a seperate modifiable variable for the simulation.
        const inflationPercent = 3;
        spReturnsByYear.push(e['return_percent'] - inflationPercent);
    }
    let spReturnPercentiles: number[] = quantileSeq(spReturnsByYear, 100) as unknown as number[];;
    return spReturnPercentiles;
}

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