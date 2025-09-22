<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import type Annotation from 'chartjs-plugin-annotation';
	import annotationPlugin, { type AnnotationPluginOptions } from 'chartjs-plugin-annotation';
	Chart.register(annotationPlugin);

	interface AnnotationLabel {
		content: string;
		value: number;
	}

	interface LineChartProps {
		title: string;
		data: number[];
		annotationLabel?: AnnotationLabel;
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
				plugins: {
					annotation: annotation
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
