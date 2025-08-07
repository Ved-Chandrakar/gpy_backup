// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all interactive components
    initSidebar();
    initTooltips();
    initAlerts();
    initCharts();
    initDataTables();
    initFormValidation();
    
    // Sidebar functionality
    function initSidebar() {
        const sidebarToggleTop = document.getElementById('sidebarToggleTop');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggleTop) {
            sidebarToggleTop.addEventListener('click', function() {
                document.body.classList.toggle('sidebar-toggled');
                sidebar.classList.toggle('toggled');
            });
        }
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                document.body.classList.toggle('sidebar-toggled');
                sidebar.classList.toggle('toggled');
            });
        }
        
        // Auto-hide sidebar on mobile after navigation
        const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
        sidebarLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth < 768) {
                    document.body.classList.add('sidebar-toggled');
                    sidebar.classList.add('toggled');
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                document.body.classList.remove('sidebar-toggled');
                sidebar.classList.remove('toggled');
            }
        });
    }
    
    // Initialize tooltips
    function initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Auto-hide alerts after 5 seconds
    function initAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            setTimeout(function() {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        });
    }
    
    // Initialize charts if Chart.js is available
    function initCharts() {
        if (typeof Chart !== 'undefined') {
            // Add any global chart configuration here
            Chart.defaults.font.family = 'Noto Sans Devanagari';
            Chart.defaults.color = '#6c757d';
            Chart.defaults.plugins.legend.position = 'bottom';
        }
    }
    
    // Initialize DataTables if available
    function initDataTables() {
        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            $('.datatable').DataTable({
                language: {
                    "sEmptyTable": "टेबल में कोई डेटा उपलब्ध नहीं है",
                    "sInfo": "_START_ से _END_ तक, कुल _TOTAL_ entries",
                    "sInfoEmpty": "0 से 0 तक, कुल 0 entries",
                    "sInfoFiltered": "(कुल _MAX_ entries में से filtered)",
                    "sInfoPostFix": "",
                    "sInfoThousands": ",",
                    "sLengthMenu": "_MENU_ entries प्रति पृष्ठ दिखाएं",
                    "sLoadingRecords": "लोड हो रहा है...",
                    "sProcessing": "प्रोसेसिंग...",
                    "sSearch": "खोजें:",
                    "sSearchPlaceholder": "खोजें...",
                    "sZeroRecords": "कोई मिलान रिकॉर्ड नहीं मिला",
                    "oPaginate": {
                        "sFirst": "पहला",
                        "sLast": "अंतिम",
                        "sNext": "अगला",
                        "sPrevious": "पिछला"
                    },
                    "oAria": {
                        "sSortAscending": ": आरोही क्रम में सॉर्ट करें",
                        "sSortDescending": ": अवरोही क्रम में सॉर्ट करें"
                    }
                }
            });
        }
    }
    
    // Form validation
    function initFormValidation() {
        const forms = document.querySelectorAll('.needs-validation');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        });
    }
    
    // Utility functions
    window.AdminPanel = {
        // Show loading state
        showLoading: function(element) {
            const original = element.innerHTML;
            element.innerHTML = '<span class="loading"></span> लोड हो रहा है...';
            element.disabled = true;
            return original;
        },
        
        // Hide loading state
        hideLoading: function(element, originalContent) {
            element.innerHTML = originalContent;
            element.disabled = false;
        },
        
        // Show notification
        showNotification: function(message, type = 'success') {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            alertDiv.style.top = '20px';
            alertDiv.style.right = '20px';
            alertDiv.style.zIndex = '9999';
            alertDiv.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(alertDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(function() {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 5000);
        },
        
        // Confirm dialog
        confirm: function(message, callback) {
            if (confirm(message)) {
                callback();
            }
        },
        
        // Format number with Indian locale
        formatNumber: function(number) {
            return new Intl.NumberFormat('hi-IN').format(number);
        },
        
        // Format date
        formatDate: function(date) {
            return new Intl.DateTimeFormat('hi-IN').format(new Date(date));
        }
    };
    
    // Handle search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const target = document.querySelector(this.dataset.target);
            
            if (target) {
                const rows = target.querySelectorAll('tbody tr');
                rows.forEach(function(row) {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            }
        });
    });
    
    // Handle filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(function(select) {
        select.addEventListener('change', function() {
            const value = this.value;
            const target = document.querySelector(this.dataset.target);
            const column = this.dataset.column;
            
            if (target) {
                const rows = target.querySelectorAll('tbody tr');
                rows.forEach(function(row) {
                    const cell = row.cells[column];
                    if (cell) {
                        const cellText = cell.textContent.trim();
                        row.style.display = (!value || cellText === value) ? '' : 'none';
                    }
                });
            }
        });
    });
    
    // Handle photo modal
    const photoLinks = document.querySelectorAll('.photo-link');
    photoLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const imgSrc = this.href;
            const modal = document.getElementById('photoModal');
            
            if (modal) {
                const modalImg = modal.querySelector('.modal-body img');
                if (modalImg) {
                    modalImg.src = imgSrc;
                }
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        });
    });
    
    // Handle delete confirmations
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const itemName = this.dataset.item || 'आइटम';
            const href = this.href;
            
            if (confirm(`क्या आप वाकई इस ${itemName} को डिलीट करना चाहते हैं?`)) {
                window.location.href = href;
            }
        });
    });
    
    // Handle form auto-save (for larger forms)
    const autoSaveForms = document.querySelectorAll('.auto-save-form');
    autoSaveForms.forEach(function(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            input.addEventListener('change', function() {
                // Save to localStorage
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                localStorage.setItem('auto-save-' + form.id, JSON.stringify(data));
            });
        });
        
        // Restore from localStorage on page load
        const savedData = localStorage.getItem('auto-save-' + form.id);
        if (savedData) {
            const data = JSON.parse(savedData);
            for (let key in data) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                }
            }
        }
    });
    
    // Clear auto-save data on successful form submission
    document.addEventListener('submit', function(e) {
        if (e.target.classList.contains('auto-save-form')) {
            localStorage.removeItem('auto-save-' + e.target.id);
        }
    });
    
    // Add loading animation to all buttons with data-loading attribute
    const loadingButtons = document.querySelectorAll('[data-loading]');
    loadingButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const loadingText = this.dataset.loading || 'लोड हो रहा है...';
            const originalText = this.innerHTML;
            
            this.innerHTML = '<span class="loading"></span> ' + loadingText;
            this.disabled = true;
            
            // Re-enable after form submission or navigation
            setTimeout(function() {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 3000);
        });
    });
    
    // Initialize progress bars animation
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(function(bar) {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(function() {
            bar.style.width = width;
        }, 500);
    });
    
    // Handle copy to clipboard functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const text = this.dataset.copy;
            navigator.clipboard.writeText(text).then(function() {
                AdminPanel.showNotification('कॉपी किया गया!', 'success');
            });
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save forms
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const form = document.querySelector('form');
            if (form) {
                form.submit();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(function(modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
        }
    });
    
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(function(card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(function() {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    console.log('Admin Panel initialized successfully!');
    
    // Dashboard Dynamic Functions
    let autoRefreshInterval = null;
    let autoRefreshEnabled = false;
    
    // Refresh dashboard data
    async function refreshDashboard() {
        const refreshBtn = document.getElementById('refreshBtn');
        const refreshIcon = refreshBtn.querySelector('i');
        
        // Show loading state
        refreshIcon.classList.add('fa-spin');
        refreshBtn.disabled = true;
        
        try {
            const response = await fetch('/admin/api/dashboard-data');
            const result = await response.json();
            
            if (result.success) {
                updateDashboardElements(result.data);
                updateLastUpdatedTime();
                showSuccessToast('डैशबोर्ड अपडेट हो गया');
            } else {
                showErrorToast('डैशबोर्ड अपडेट करने में त्रुटि');
            }
        } catch (error) {
            console.error('Dashboard refresh error:', error);
            showErrorToast('डैशबोर्ड अपडेट करने में त्रुटि');
        } finally {
            // Remove loading state
            refreshIcon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }
    }
    
    // Update dashboard elements with new data
    function updateDashboardElements(data) {
        const { stats, realTimeData, recentActivities } = data;
        
        // Update stats cards
        if (stats) {
            updateElement('totalMothers', stats.totalMothers);
            updateElement('totalPlants', stats.totalPlants);
            updateElement('totalAssignments', stats.totalAssignments);
            updateElement('totalUsers', stats.totalUsers);
            updateElement('activeUsers', stats.activeUsers);
            updateElement('thisMonthMothers', stats.thisMonthMothers);
            updateElement('pendingAssignments', stats.pendingAssignments);
            updateElement('mothersGrowth', `${stats.mothersGrowth >= 0 ? '+' : ''}${stats.mothersGrowth}%`);
            updateElement('completionRate', `${stats.assignmentCompletionRate}%`);
            updateElement('progressRate', `${Math.max(0, 100 - stats.assignmentCompletionRate)}%`);
            updateElement('verificationRate', `${stats.photoVerificationRate}%`);
        }
        
        // Update real-time alerts
        updateRealTimeAlerts(realTimeData);
        
        // Update recent activities
        updateRecentActivities(recentActivities);
        
        // Update charts if they exist
        updateCharts(data);
    }
    
    // Update individual element
    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Add animation effect
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.textContent = value;
                element.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    // Update real-time alerts
    function updateRealTimeAlerts(realTimeData) {
        const alertsContainer = document.getElementById('realTimeAlerts');
        if (!alertsContainer || !realTimeData) return;
        
        let alertsHtml = '';
        
        if (realTimeData.todayRegistrations > 0) {
            alertsHtml += `
                <div class="col-md-3">
                    <div class="alert alert-success alert-dismissible fade show py-2">
                        <i class="fas fa-user-plus me-2"></i>
                        <strong>${realTimeData.todayRegistrations}</strong> नए पंजीकरण आज
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                </div>
            `;
        }
        
        if (realTimeData.pendingVerifications > 0) {
            alertsHtml += `
                <div class="col-md-3">
                    <div class="alert alert-warning alert-dismissible fade show py-2">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>${realTimeData.pendingVerifications}</strong> फोटो वेरिफिकेशन पेंडिंग
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                </div>
            `;
        }
        
        if (realTimeData.overdueTasks > 0) {
            alertsHtml += `
                <div class="col-md-3">
                    <div class="alert alert-danger alert-dismissible fade show py-2">
                        <i class="fas fa-clock me-2"></i>
                        <strong>${realTimeData.overdueTasks}</strong> ओवरड्यू कार्य
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                </div>
            `;
        }
        
        alertsContainer.innerHTML = alertsHtml;
    }
    
    // Update recent activities
    function updateRecentActivities(activities) {
        const activityList = document.getElementById('activityList');
        if (!activityList || !activities) return;
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-info-circle mb-2"></i>
                    <p>कोई हाल की गतिविधि नहीं मिली</p>
                </div>
            `;
            return;
        }
        
        const activitiesHtml = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">
                    <i class="fas fa-clock"></i>
                    ${getTimeAgo(activity.created_at)}
                </div>
            </div>
        `).join('');
        
        activityList.innerHTML = activitiesHtml;
    }
    
    // Toggle auto refresh
    function toggleAutoRefresh() {
        const autoRefreshBtn = document.getElementById('autoRefreshBtn');
        const icon = autoRefreshBtn.querySelector('i');
        
        if (autoRefreshEnabled) {
            // Disable auto refresh
            clearInterval(autoRefreshInterval);
            autoRefreshEnabled = false;
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            autoRefreshBtn.innerHTML = '<i class="fas fa-play me-1"></i>ऑटो रिफ्रेश';
            showInfoToast('ऑटो रिफ्रेश बंद हो गया');
        } else {
            // Enable auto refresh (every 30 seconds)
            autoRefreshInterval = setInterval(refreshDashboard, 30000);
            autoRefreshEnabled = true;
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            autoRefreshBtn.innerHTML = '<i class="fas fa-pause me-1"></i>रिफ्रेश बंद करें';
            showInfoToast('ऑटो रिफ्रेश चालू हो गया (30 सेकंड)');
        }
    }
    
    // Update last updated time
    function updateLastUpdatedTime() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.innerHTML = `
                <i class="fas fa-clock me-1"></i>
                ${now.toLocaleString('hi-IN')}
            `;
        }
    }
    
    // Helper function for time ago
    function getTimeAgo(dateString) {
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
    
        if (diffMins < 1) return 'अभी अभी';
        if (diffMins < 60) return `${diffMins} मिनट पहले`;
        if (diffHours < 24) return `${diffHours} घंटे पहले`;
        if (diffDays < 7) return `${diffDays} दिन पहले`;
        return then.toLocaleDateString('hi-IN');
    }
    
    // Update charts with new data
    function updateCharts(data) {
        // Update daily comparison chart if it exists
        if (window.dailyChart && data.monthlyStats) {
            const dailyData = data.monthlyStats;
            window.dailyChart.data.labels = dailyData.map(d => d.date);
            window.dailyChart.data.datasets[0].data = dailyData.map(d => d.registrations);
            window.dailyChart.data.datasets[1].data = dailyData.map(d => d.assignments);
            window.dailyChart.update('active');
        }
        
        // Update district chart if it exists
        if (window.districtChart && data.districtStats) {
            window.districtChart.data.labels = data.districtStats.map(d => d.name);
            window.districtChart.data.datasets[0].data = data.districtStats.map(d => d.count);
            window.districtChart.update();
        }
    }
    
    // Toast notification functions
    function showSuccessToast(message) {
        showToast(message, 'success');
    }
    
    function showErrorToast(message) {
        showToast(message, 'error');
    }
    
    function showInfoToast(message) {
        showToast(message, 'info');
    }
    
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Add to toast container
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    // Initialize dashboard on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Auto refresh on page load after 5 seconds
        setTimeout(() => {
            refreshDashboard();
        }, 5000);
    });
});
