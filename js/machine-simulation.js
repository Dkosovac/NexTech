// js/machine-simulation.js
class MachineSimulation {
    constructor() {
        this.isRunning = false;
        this.sensors = {
            temperature: { value: 85, min: 20, max: 120, unit: '°C', status: 'normal' },
            rpm: { value: 1450, min: 0, max: 2000, unit: 'RPM', status: 'optimal' },
            fuel: { value: 65, min: 0, max: 100, unit: '%', status: 'medium' },
            oilPressure: { value: 3.2, min: 1.5, max: 5.0, unit: 'bar', status: 'normal' },
            vibration: { value: 2.1, min: 0, max: 10, unit: 'mm/s', status: 'low' },
            power: { value: 45, min: 0, max: 100, unit: 'kW', status: 'normal' }
        };
        
        this.alerts = [];
        this.history = {
            temperature: [],
            rpm: [],
            fuel: []
        };
        
        this.init();
    }
    
    init() {
        // Inicijalizuj UI elemente
        this.elements = {
            startBtn: document.getElementById('start-machine'),
            stopBtn: document.getElementById('stop-machine'),
            resetBtn: document.getElementById('reset-simulation'),
            statusIndicator: document.querySelector('.status-indicator'),
            machineParts: document.querySelectorAll('.animate-spin')
        };
        
        this.setupEventListeners();
        this.generateHistoryData();
        this.updateDashboard();
    }
    
    setupEventListeners() {
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.start());
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stop());
        }
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.reset());
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        // Animiraj delove mašine
        this.elements.machineParts.forEach(part => {
            part.style.animationPlayState = 'running';
        });
        
        // Promeni status
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.innerHTML = `
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-sm font-semibold text-green-400">OPERATIVNO</span>
            `;
        }
        
        // Dodaj alert
        this.addAlert('Sistem pokrenut', 'success', 'Mašina #MX-245 je uspešno pokrenuta.');
        
        // Pokreni simulaciju podataka
        this.simulationInterval = setInterval(() => this.updateSensors(), 2000);
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.simulationInterval);
        
        // Zaustavi animacije
        this.elements.machineParts.forEach(part => {
            part.style.animationPlayState = 'paused';
        });
        
        // Promeni status
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.innerHTML = `
                <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span class="text-sm font-semibold text-red-400">ZAUSTAVLJENO</span>
            `;
        }
        
        this.addAlert('Sistem zaustavljen', 'warning', 'Mašina #MX-245 je zaustavljena.');
    }
    
    reset() {
        this.stop();
        
        // Resetuj senzore na početne vrednosti
        this.sensors = {
            temperature: { value: 85, min: 20, max: 120, unit: '°C', status: 'normal' },
            rpm: { value: 1450, min: 0, max: 2000, unit: 'RPM', status: 'optimal' },
            fuel: { value: 65, min: 0, max: 100, unit: '%', status: 'medium' },
            oilPressure: { value: 3.2, min: 1.5, max: 5.0, unit: 'bar', status: 'normal' },
            vibration: { value: 2.1, min: 0, max: 10, unit: 'mm/s', status: 'low' },
            power: { value: 45, min: 0, max: 100, unit: 'kW', status: 'normal' }
        };
        
        this.alerts = [];
        this.updateDashboard();
        this.generateHistoryData();
        
        this.addAlert('Sistem resetovan', 'info', 'Sve vrednosti su vraćene na početne.');
    }
    
    updateSensors() {
        if (!this.isRunning) return;
        
        // Simuliraj promene senzora
        this.sensors.temperature.value += (Math.random() - 0.5) * 2;
        this.sensors.rpm.value += (Math.random() - 0.5) * 20;
        this.sensors.fuel.value -= 0.1;
        this.sensors.oilPressure.value += (Math.random() - 0.5) * 0.1;
        
        // Ograniči vrednosti
        this.sensors.temperature.value = Math.max(this.sensors.temperature.min, 
            Math.min(this.sensors.temperature.max, this.sensors.temperature.value));
        this.sensors.rpm.value = Math.max(this.sensors.rpm.min, 
            Math.min(this.sensors.rpm.max, this.sensors.rpm.value));
        this.sensors.fuel.value = Math.max(0, this.sensors.fuel.value);
        
        // Proveri alarme
        this.checkAlarms();
        
        // Dodaj u istoriju
        this.addToHistory();
        
        // Ažuriraj UI
        this.updateDashboard();
    }
    
    checkAlarms() {
        // Temperaturni alarm
        if (this.sensors.temperature.value > 100) {
            this.sensors.temperature.status = 'critical';
            this.addAlert('Visoka temperatura!', 'danger', 
                `Temperatura motora: ${this.sensors.temperature.value.toFixed(1)}°C`);
        } else if (this.sensors.temperature.value > 90) {
            this.sensors.temperature.status = 'warning';
        } else {
            this.sensors.temperature.status = 'normal';
        }
        
        // Nivo goriva alarm
        if (this.sensors.fuel.value < 20) {
            this.sensors.fuel.status = 'critical';
            this.addAlert('Nizak nivo goriva!', 'danger',
                `Preostalo gorivo: ${this.sensors.fuel.value.toFixed(1)}%`);
        } else if (this.sensors.fuel.value < 40) {
            this.sensors.fuel.status = 'warning';
        } else {
            this.sensors.fuel.status = 'medium';
        }
        
        // RPM alarm
        if (this.sensors.rpm.value > 1800) {
            this.sensors.rpm.status = 'warning';
        } else if (this.sensors.rpm.value < 1000 && this.isRunning) {
            this.sensors.rpm.status = 'warning';
        } else {
            this.sensors.rpm.status = 'optimal';
        }
    }
    
    addAlert(title, type, message) {
        const alert = {
            id: Date.now(),
            title,
            type, // success, warning, danger, info
            message,
            timestamp: new Date()
        };
        
        this.alerts.unshift(alert);
        
        // Održavaj maksimalno 10 alertova
        if (this.alerts.length > 10) {
            this.alerts.pop();
        }
        
        // Ažuriraj UI
        this.updateAlertsUI();
    }
    
    updateDashboard() {
        // Ažuriraj vrednosti senzora
        Object.keys(this.sensors).forEach(sensor => {
            const element = document.getElementById(`${sensor}-value`);
            const bar = document.getElementById(`${sensor}-bar`);
            const status = document.getElementById(`${sensor}-status`);
            
            if (element) {
                element.textContent = `${this.sensors[sensor].value.toFixed(1)}${this.sensors[sensor].unit}`;
            }
            
            if (bar) {
                const percentage = ((this.sensors[sensor].value - this.sensors[sensor].min) / 
                    (this.sensors[sensor].max - this.sensors[sensor].min)) * 100;
                bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            }
            
            if (status) {
                status.textContent = this.sensors[sensor].status.toUpperCase();
                status.className = 'text-xs ' + this.getStatusColor(this.sensors[sensor].status);
            }
        });
        
        // Ažuriraj grafike
        this.updateCharts();
    }
    
    updateAlertsUI() {
        const container = document.getElementById('alerts-container');
        if (!container) return;
        
        container.innerHTML = this.alerts.map(alert => `
            <div class="flex items-center justify-between p-3 ${this.getAlertBg(alert.type)} border ${this.getAlertBorder(alert.type)} rounded-lg">
                <div class="flex items-center">
                    <i class="${this.getAlertIcon(alert.type)} mr-3"></i>
                    <div>
                        <div class="font-medium">${alert.title}</div>
                        <div class="text-xs text-gray-400">${alert.message}</div>
                    </div>
                </div>
                <span class="text-xs ${this.getAlertTextColor(alert.type)}">
                    ${this.formatTime(alert.timestamp)}
                </span>
            </div>
        `).join('');
    }
    
    generateHistoryData() {
        // Generiši podatke za grafikone
        for (let i = 0; i < 24; i++) {
            this.history.temperature.push(80 + Math.random() * 20);
            this.history.rpm.push(1400 + Math.random() * 200);
            this.history.fuel.push(Math.max(0, 65 - i * 2 + Math.random() * 4));
        }
    }
    
    updateCharts() {
        // Ažuriraj grafikone
        this.renderChart('temp-chart', this.history.temperature, '#00f3ff');
        this.renderChart('fuel-chart', this.history.fuel, '#ff0080');
    }
    
    renderChart(containerId, data, color) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const max = Math.max(...data);
        const bars = data.map((value, i) => {
            const height = (value / max) * 100;
            return `
                <div class="flex-1 flex flex-col items-center">
                    <div class="w-3 rounded-t-lg" style="height: ${height}%; background: ${color}"></div>
                    <div class="text-xs text-gray-500 mt-1">${i}h</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = bars;
    }
    
    addToHistory() {
        // Dodaj trenutne vrednosti u istoriju
        this.history.temperature.push(this.sensors.temperature.value);
        this.history.rpm.push(this.sensors.rpm.value);
        this.history.fuel.push(this.sensors.fuel.value);
        
        // Održavaj samo poslednjih 24 vrednosti
        if (this.history.temperature.length > 24) {
            this.history.temperature.shift();
            this.history.rpm.shift();
            this.history.fuel.shift();
        }
    }
    
    // Pomoćne funkcije za stilove
    getStatusColor(status) {
        const colors = {
            normal: 'text-green-400',
            optimal: 'text-green-400',
            medium: 'text-yellow-400',
            warning: 'text-yellow-400',
            critical: 'text-red-400',
            low: 'text-blue-400'
        };
        return colors[status] || 'text-gray-400';
    }
    
    getAlertBg(type) {
        const colors = {
            success: 'bg-green-500/10',
            warning: 'bg-yellow-500/10',
            danger: 'bg-red-500/10',
            info: 'bg-blue-500/10'
        };
        return colors[type] || 'bg-gray-500/10';
    }
    
    getAlertBorder(type) {
        const colors = {
            success: 'border-green-500/30',
            warning: 'border-yellow-500/30',
            danger: 'border-red-500/30',
            info: 'border-blue-500/30'
        };
        return colors[type] || 'border-gray-500/30';
    }
    
    getAlertIcon(type) {
        const icons = {
            success: 'fas fa-check-circle text-green-500',
            warning: 'fas fa-exclamation-triangle text-yellow-500',
            danger: 'fas fa-times-circle text-red-500',
            info: 'fas fa-info-circle text-blue-500'
        };
        return icons[type] || 'fas fa-bell text-gray-500';
    }
    
    getAlertTextColor(type) {
        const colors = {
            success: 'text-green-500',
            warning: 'text-yellow-500',
            danger: 'text-red-500',
            info: 'text-blue-500'
        };
        return colors[type] || 'text-gray-500';
    }
    
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'upravo sada';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString('sr-RS');
    }
}

// Inicijalizacija
document.addEventListener('DOMContentLoaded', () => {
    window.machineSimulation = new MachineSimulation();
});