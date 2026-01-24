<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import type Annotation from 'chartjs-plugin-annotation';
	import annotationPlugin, {
		type AnnotationPluginOptions
	} from 'chartjs-plugin-annotation';
	import { currencyFormat } from './formatter';
	Chart.register(annotationPlugin);

	interface LineChartProps {
		title: string;
		data: number[];
		xLabels: number[];
		currentAge?: number;
		retirementAge?: number;
		mode?: 'savings' | 'confidence';
		label?: string;
	}

	let props: LineChartProps = $props();
	const mode = props.mode || 'savings';

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	$effect(drawChart);

	function formatPercentage(value: number): string {
		return (value * 100).toFixed(1) + '%';
	}

	function drawChart(): void {
		if (chart) {
			chart.destroy();
		}

		let datasets: any[];
		let labels: number[];
		let yAxisFormatter: (value: number) => string;
		let tooltipFormatter: (value: number) => string;

		if (mode === 'confidence') {
			// Simple confidence chart
			labels = props.xLabels;
			yAxisFormatter = formatPercentage;
			tooltipFormatter = formatPercentage;
			datasets = [
				{
					label: props.label || 'Confidence',
					data: props.data,
					borderColor: '#4a90e2',
					backgroundColor: 'rgba(74, 144, 226, 0.2)',
					borderWidth: 2,
					fill: true,
					tension: 0.1,
					clip: false
				}
			];
		} else {
			// Savings chart with working/retired split
			if (!props.currentAge || !props.retirementAge) {
				console.error('currentAge and retirementAge required for savings mode');
				return;
			}
			const retirementIndex = props.retirementAge - props.currentAge;
			const workingData = [
				...props.data.slice(0, retirementIndex + 1),
				...new Array(props.data.length - retirementIndex - 1).fill(null)
			];
			const retiredData = [
				...new Array(retirementIndex).fill(null),
				...props.data.slice(retirementIndex)
			];
			labels = props.xLabels;
			yAxisFormatter = currencyFormat;
			tooltipFormatter = currencyFormat;
			datasets = [
				{
					label: 'Working (Contributing)',
					data: workingData,
					borderColor: '#4a90e2',
					backgroundColor: 'rgba(74, 144, 226, 0.2)',
					borderWidth: 2,
					fill: true,
					tension: 0.1,
					hidden: false,
					order: 1
				},
				{
					label: 'Retired (Withdrawing)',
					data: retiredData,
					borderColor: '#e24a4a',
					backgroundColor: 'rgba(226, 74, 74, 0.2)',
					borderWidth: 2,
					fill: true,
					tension: 0.1,
					hidden: false,
					order: 1
				}
			];
		}

		chart = new Chart(chartCanvas, {
			type: 'line',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding:
						mode === 'confidence'
							? { top: 10, bottom: 0, left: 0, right: 0 }
							: undefined
				},
				plugins: {
					tooltip: {
						callbacks: {
							label: function (context: any) {
								return tooltipFormatter(context.parsed.y);
							},
							title: function (context: any) {
								return mode === 'confidence'
									? 'Retirement Age ' + context[0].label
									: 'Age ' + context[0].label;
							}
						},
						displayColors: false
					},
					legend: {
						display: true,
						position: 'top',
						labels: {
							font: {
								family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
							},
							color: '#2c2c2c',
							usePointStyle: false,
							boxWidth: 15,
							boxHeight: 5,
							padding: 15
						}
					},
					title: {
						display: true,
						text: props.title,
						font: {
							family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
							size: 16
						},
						color: '#2c2c2c',
						padding: 20
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Age',
							font: {
								family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
							},
							color: '#2c2c2c'
						},
						grid: {
							color: '#e8e8e8'
						},
						ticks: {
							color: '#6b6b6b',
							font: {
								family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
							}
						}
					},
					y: {
						grid: {
							color: '#e8e8e8'
						},
						ticks: {
							color: '#6b6b6b',
							font: {
								family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
							},
							callback: function (value) {
								return yAxisFormatter(value as number);
							},
							...(mode === 'confidence' && {
								stepSize: 0.1,
								max: 1
							})
						},
						...(mode === 'confidence' && {
							min: 0,
							max: 1
						})
					}
				}
			},
			data: {
				labels: labels,
				datasets: datasets
			}
		});
	}
</script>

<div class="chart-container">
	<canvas bind:this={chartCanvas}></canvas>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 500px;
		position: relative;
	}

	.chart-container canvas {
		max-width: 100%;
	}
</style>
