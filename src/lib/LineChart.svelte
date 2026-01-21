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
		currentAge: number;
		retirementAge: number;
	}

	let props: LineChartProps = $props();

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	$effect(drawChart);

	function drawChart(): void {
		if (chart) {
			chart.destroy();
		}
		
		// Split data at retirement age for different fill colors
		const retirementIndex = props.retirementAge - props.currentAge;
		// Create arrays with null padding to align with labels
		const workingData = [...props.data.slice(0, retirementIndex + 1), ...new Array(props.data.length - retirementIndex - 1).fill(null)];
		const retiredData = [...new Array(retirementIndex).fill(null), ...props.data.slice(retirementIndex)];
		
		chart = new Chart(chartCanvas, {
			type: 'line',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
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
							padding: 15,
							filter: function(legendItem: any, chartData: any) {
								// Only show legend for "Working" and "Retired" datasets
								return legendItem.text === 'Working (Contributing)' || legendItem.text === 'Retired (Withdrawing)';
							}
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
								return currencyFormat(value as number);
							}
						}
					}
				}
			},
			data: {
				labels: generateAgeLabels(props.data.length, props.currentAge),
				datasets: [
					{
						label: 'Savings',
						data: workingData,
						borderColor: '#ba8e23',
						backgroundColor: 'rgba(186, 142, 35, 0.2)',
						borderWidth: 2,
						fill: true,
						tension: 0.1,
						hidden: false,
						order: 1
					},
					{
						label: 'Savings',
						data: retiredData,
						borderColor: '#e24a4a',
						backgroundColor: 'rgba(226, 74, 74, 0.2)',
						borderWidth: 2,
						fill: true,
						tension: 0.1,
						hidden: false,
						order: 1
					},
					// Invisible datasets for legend only
					{
						label: 'Working (Contributing)',
						data: [],
						borderColor: '#ba8e23',
						backgroundColor: '#ba8e23',
						borderWidth: 2,
						pointRadius: 0,
						pointHoverRadius: 0,
						pointHitRadius: 0,
						order: -1
					},
					{
						label: 'Retired (Withdrawing)',
						data: [],
						borderColor: '#e24a4a',
						backgroundColor: '#e24a4a',
						borderWidth: 2,
						pointRadius: 0,
						pointHoverRadius: 0,
						pointHitRadius: 0,
						order: -1
					}
				]
			}
		});
	}

	function generateAgeLabels(length: number, currentAge: number): number[] {
		let labels = [];
		for (let i = 0; i < length; i++) {
			labels.push(currentAge + i);
		}
		return labels;
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
