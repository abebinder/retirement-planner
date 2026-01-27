<script lang="ts">
	import { Chart, type ChartDataset, type TooltipItem } from 'chart.js/auto';
	import annotationPlugin from 'chartjs-plugin-annotation';

	// Color constants
	const COLOR_BLUE = 'rgba(74, 144, 226, 1)';
	const COLOR_BLUE_ALPHA = 'rgba(74, 144, 226, 0.2)';
	const COLOR_RED = 'rgba(226, 74, 74, 1)';
	const COLOR_RED_ALPHA = 'rgba(226, 74, 74, 0.2)';
	const COLOR_DARK_GRAY = 'rgba(44, 44, 44, 1)';

	Chart.register(annotationPlugin);

	interface DataSet {
		data: (number | null)[];
		label: string;
	}

	interface LineChartProps {
		title: string;
		xLabels: number[];
		datasets: DataSet[];
		xAxisLabel: string;
		formatter: (value: number) => string;
	}

	let props: LineChartProps = $props();

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	$effect(drawChart);

	// Color rotation: blue, red, blue, red, etc.
	const colors = [
		{ border: COLOR_BLUE, background: COLOR_BLUE_ALPHA },
		{ border: COLOR_RED, background: COLOR_RED_ALPHA }
	];

	function getColor(index: number) {
		return colors[index % colors.length];
	}

	function drawChart(): void {
		if (chart) {
			chart.destroy();
		}

		// Build Chart.js datasets from props.datasets
		const chartDatasets: ChartDataset<'line', (number | null)[]>[] = [];
		for (let i = 0; i < props.datasets.length; i++) {
			const dataset = props.datasets[i];
			const color = getColor(i);
			chartDatasets.push({
				label: dataset.label,
				data: dataset.data,
				borderColor: color.border,
				backgroundColor: color.background,
				fill: true,
				clip: false
			});
		}

		chart = new Chart(chartCanvas, {
			type: 'line',
			options: {
				maintainAspectRatio: false,
				plugins: {
					tooltip: {
						callbacks: {
							label: function (context: TooltipItem<'line'>) {
								return props.formatter(context.parsed.y);
							},
							title: function (context: TooltipItem<'line'>[]) {
								return props.xAxisLabel + ' ' + context[0].label;
							}
						},
						displayColors: false
					},
					title: {
						display: true,
						text: props.title,
						font: {
							size: 16
						},
						color: COLOR_DARK_GRAY
					}
				},
				scales: {
					x: {
						title: {
							text: props.xAxisLabel
						}
					},
					y: {
						ticks: {
							callback: function (tickValue: string | number) {
								return props.formatter(Number(tickValue));
							}
						},
						min: 0
					}
				}
			},
			data: {
				labels: props.xLabels,
				datasets: chartDatasets
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
