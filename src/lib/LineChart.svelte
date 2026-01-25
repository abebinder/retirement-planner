<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import annotationPlugin from 'chartjs-plugin-annotation';
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
		{ border: '#4a90e2', background: 'rgba(74, 144, 226, 0.2)' },
		{ border: '#e24a4a', background: 'rgba(226, 74, 74, 0.2)' }
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
				clip: false as const
			});
		}

		// Determine Y axis configuration
		const yAxisConfig: any = {
			grid: {
				color: '#e8e8e8'
			},
			ticks: {
				color: '#6b6b6b',
				font: {
					family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
				},
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
							text: props.xAxisLabel,
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
