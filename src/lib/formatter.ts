export function currencyFormat(value: number): string {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
	return formatter.format(value);
}

export function percentageFormat(value: number): string {
	return (value * 100).toFixed(1) + '%';
}
