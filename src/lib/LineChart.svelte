<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import type Annotation from 'chartjs-plugin-annotation';
	import annotationPlugin, {
		type AnnotationPluginOptions
	} from 'chartjs-plugin-annotation';
	import { currencyFormat } from './formatter';
	Chart.register(annotationPlugin);

	interface AnnotationLabel {
		content: string;
		value: number;
	}

	interface LineChartProps {
		title: string;
		data: number[];
		annotationLabel?: AnnotationLabel;
		currentAge: number;
		retirementAge?: number;
	}

	let props: LineChartProps = $props();

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	$effect(drawChart);

	function drawChart(): void {
		if (chart) {
			chart.destroy();
		}
		let annotation: AnnotationPluginOptions | undefined = undefined;

		if (props.annotationLabel) {
			annotation = {
				annotations: {
					line1: {
						type: 'line',
						label: {
							content: props.annotationLabel.content,
							display: true
						},
						yMin: props.annotationLabel.value,
						yMax: props.annotationLabel.value
					}
				}
			};
		}
		chart = new Chart(chartCanvas, {
			type: 'line',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					annotation: annotation,
					legend: {
						display: false
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
						label: 'Savings By Year',
						data: props.data,
						borderColor: '#4a90e2',
						backgroundColor: 'rgba(74, 144, 226, 0.1)',
						segment: {
							borderColor: function(ctx) {
								if (!props.retirementAge) {
									return '#4a90e2';
								}
								// Check the age at the end of the segment (p1)
								const age = props.currentAge + ctx.p1DataIndex;
								return age <= props.retirementAge ? '#ba8e23' : '#e24a4a';
							}
						},
						borderWidth: 2,
						fill: true,
						tension: 0.1
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
