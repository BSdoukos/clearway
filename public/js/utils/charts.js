const charts = {};

if (stats.taskCompletion) {
    charts.taskCompletion = new Chart(
        document.getElementById('taskCompletionChart'),
        {
            type: 'doughnut',
            data: {
                labels: [
                    'Accomplished',
                    'Unaccomplished'
                ],
                datasets: [{
                    label: 'Task completion',
                    data: [stats.taskCompletion.completed, stats.taskCompletion.uncompleted],
                    backgroundColor: [
                        '#fabb18',
                        '#f4f4f4'
                    ]
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom',
                        title: {
                            display: true,
                            padding: 5
                        },
                        onClick: (e) => e.stopPropagation()
                    }
                },
                cutout: 80
            }
        }
    );
}

if (stats.tasksByContext) {
    charts.tasksByContext = new Chart(
        document.getElementById('tasksByContextChart'),
        {
            type: 'doughnut',
            data: {
                labels: [...Object.keys(stats.tasksByContext)],
                datasets: [{
                    label: 'Tasks by context',
                    data: [...Object.values(stats.tasksByContext)],
                    backgroundColor: [
                        '#fabb18',
                        '#C9C9C9',
                        '#858585',
                        '#F08406'
                    ]
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom',
                        title: {
                            display: true,
                            padding: 5
                        },
                        onClick: (e) => e.stopPropagation()
                    }
                },
                cutout: 80
            }
        }
    );
}

if (stats.projectCompletion) {
    charts.projectCompletion = new Chart(
        document.getElementById('projectCompletionChart'),
        {
            type: 'doughnut',
            data: {
                labels: [
                    'Completed percentage',
                    'Uncompleted percentage'
                ],
                datasets: [{
                    label: 'Project completion',
                    data: [stats.projectCompletion.completedPercentage, stats.projectCompletion.uncompletedPercentage],
                    backgroundColor: [
                        '#fabb18',
                        '#f4f4f4'
                    ]
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom',
                        title: {
                            display: true,
                            padding: 5
                        },
                        onClick: (e) => e.stopPropagation()
                    }
                },
                cutout: 80
            }
        }
    );
}

if (stats.workHistory) {
    charts.workHistory = new Chart(
        document.getElementById('workHistoryChart'),
        {
            type: 'line',
            data: {
                labels: stats.workHistory.map((period) => period.periodStart),
                datasets: [{
                    label: 'Tasks completed',
                    data: stats.workHistory.map((period) => period.tasksCompleted),
                    backgroundColor: '#fabb18'
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom',
                        title: {
                            display: true,
                            padding: 5
                        },
                        onClick: (e) => e.stopPropagation()
                    }
                },
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        }
    );
}