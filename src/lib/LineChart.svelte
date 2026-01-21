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
						data: props.data,
						borderColor: '#4a90e2',
						backgroundColor: 'rgba(74, 144, 226, 0.1)',
						segment: {
							borderColor: function(ctx) {
								// Check the age at the end of the segment (p1)
								const age = props.currentAge + ctx.p1DataIndex;
								return age <= props.retirementAge ? '#ba8e23' : '#e24a4a';
							}
						},
						borderWidth: 2,
						fill: true,
						tension: 0.1,
						hidden: false
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
