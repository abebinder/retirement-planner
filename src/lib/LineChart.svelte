<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import annotationPlugin from 'chartjs-plugin-annotation';
	Chart.register(annotationPlugin);

	// Color constants
	const COLOR_BLUE = 'rgba(74, 144, 226, 1)';
	const COLOR_BLUE_ALPHA = 'rgba(74, 144, 226, 0.2)';
	const COLOR_RED = 'rgba(226, 74, 74, 1)';
	const COLOR_RED_ALPHA = 'rgba(226, 74, 74, 0.2)';
	const COLOR_LIGHT_GRAY = 'rgba(232, 232, 232, 1)';
	const COLOR_MEDIUM_GRAY = 'rgba(107, 107, 107, 1)';
	const COLOR_DARK_GRAY = 'rgba(44, 44, 44, 1)';

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
		const chartDatasets: any[] = [];
		for (let i = 0; i < props.datasets.length; i++) {
			const dataset = props.datasets[i];
			const color = getColor(i);
			chartDatasets.push({
				label: dataset.label,
				data: dataset.data,
				borderColor: color.border,
				backgroundColor: color.background,
				borderWidth: 2,
				fill: true,
				tension: 0.1,
				hidden: false,
				order: 1,
				clip: false
			});
		}

		// Determine Y axis configuration
		const yAxisConfig: any = {
			grid: {
				color: COLOR_LIGHT_GRAY
			},
			ticks: {
				color: COLOR_MEDIUM_GRAY,
				callback: props.formatter
			},
			min: 0
		};

		chart = new Chart(chartCanvas, {
			type: 'line',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding: { top: 10, bottom: 0, left: 0, right: 0 }
				},
				plugins: {
					tooltip: {
						callbacks: {
							label: function (context: any) {
								return props.formatter(context.parsed.y);
							},
							title: function (context: any) {
								return props.xAxisLabel + ' ' + context[0].label;
							}
						},
						displayColors: false
					},
					legend: {
						display: true,
						position: 'top',
						labels: {
							color: COLOR_DARK_GRAY,
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
							size: 16
						},
						color: COLOR_DARK_GRAY,
						padding: 20
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: props.xAxisLabel,
							color: COLOR_DARK_GRAY
						},
						grid: {
							color: COLOR_LIGHT_GRAY
						},
						ticks: {
							color: COLOR_MEDIUM_GRAY
						}
					},
					y: yAxisConfig
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
