<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import annotationPlugin from 'chartjs-plugin-annotation';
	Chart.register(annotationPlugin);

	interface LineChartProps {
		title: string;
		data: number[];
		annotationLabelContent: string;
		annotationLabelValue: number;
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
				plugins: {
					annotation: {
						annotations: {
							line1: {
								type: 'line',
								label: {
									content: props.annotationLabelContent,
									display: true
								},
								yMin: props.annotationLabelValue,
								yMax: props.annotationLabelValue
							}
						}
					}
				}
			},
			data: {
				labels: generateRange(props.data.length),
				datasets: [
					{
						label: 'Savings By Year',
						data: props.data
					}
				]
			}
		});
	}

	function generateRange(length: number): number[] {
		let range = [];
		for (let i = 0; i < length; i++) {
			range.push(i);
		}
		return range;
	}
</script>

<div class="chart-container"><canvas bind:this={chartCanvas} height="500," width="500"></canvas></div>

<style>
	.chart-container {
		width: 500px;
		height: 500px;
	}
</style>
