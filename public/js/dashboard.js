// Dashboard Charts and JavaScript

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // District Chart
    const districtCtx = document.getElementById('districtChart');
    if (districtCtx) {
        new Chart(districtCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: window.districtLabels || ['रायपुर', 'बिलासपुर', 'दुर्ग', 'राजनांदगांव'],
                datasets: [{
                    data: window.districtCounts || [25, 35, 30, 20],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Monthly Chart
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        new Chart(monthlyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['जन', 'फर', 'मार', 'अप्र', 'मई', 'जून'],
                datasets: [{
                    label: 'नए पंजीकरण',
                    data: window.registrationData || [12, 19, 3, 5, 2, 3],
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4
                }, {
                    label: 'पौधे आवंटन',
                    data: window.assignmentData || [7, 14, 18, 12, 8, 15],
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat('hi-IN').format(num);
}

// Auto-refresh dashboard data every 5 minutes
setInterval(function() {
    if (typeof refreshDashboard === 'function') {
        refreshDashboard();
    }
}, 300000); // 5 minutes
