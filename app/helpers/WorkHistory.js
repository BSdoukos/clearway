module.exports = class WorkHistory {
    constructor(logs, periodUnit, periodUnitQuantity) {
        this.logs = logs;
        this.periodUnit = periodUnit;
        this.periodUnitQuantity = periodUnitQuantity;
        this.currentPeriodStart = new Date();
        this.currentPeriodEnd = new Date();
        this.data = [];
    }

    browse(unitQuantity, direction, changeStart = true, changeEnd = true) {
        const cps = this.currentPeriodStart;
        const cpe = this.currentPeriodEnd;

        if (direction === 'frontward') {
            unitQuantity = -unitQuantity; 
        }

        if (this.periodUnit === 'day') {
            if (changeStart) {
                cps.setDate(cps.getDate() - unitQuantity);
            }
            if (changeEnd) {
                cpe.setDate(cpe.getDate() - unitQuantity);
            }
        }
        if (this.periodUnit === 'week') {
            if (changeStart) {
                cps.setDate(cps.getDate() - unitQuantity * 7);
            }
            if (changeEnd) {
                cpe.setDate(cpe.getDate() - unitQuantity * 7);
            }
        }
        if (this.periodUnit === 'month') {
            if (changeStart) {
                cps.setMonth(cps.getMonth() - unitQuantity);
            }
            if (changeEnd) {
                cpe.setMonth(cpe.getMonth() - unitQuantity);
            }
        }
    }

    retrieveLogs() {
        return this.logs.filter((date) => date >= this.currentPeriodStart && date < this.currentPeriodEnd);
    }

    fill() {
        this.currentPeriodStart.setHours(0, 0, 0, 0);
        this.currentPeriodEnd.setHours(0, 0, 0, 0);

        if (this.periodUnit === 'month') {
            this.currentPeriodStart.setDate(1);
            this.currentPeriodEnd.setDate(1);
        }

        this.browse(1, 'frontward', false);

        let i = 0;
        do {
            this.data.push({
                periodStart: this.currentPeriodStart.toDateString(),
                periodEnd: this.currentPeriodEnd.toDateString(),
                tasksCompleted: this.retrieveLogs().length
            });

            this.browse(1, 'backward');
            i++;

        } while (i < this.periodUnitQuantity);
    }

    format() {
        if (this.periodUnit === 'day') {
            this.data.forEach((period, i, arr) => arr[i].periodStart = period.periodStart.slice(0, 4));
        } else if (this.periodUnit === 'week') {
            this.data.forEach((period, i, arr) => arr[i].periodStart = period.periodStart.slice(4, 10) + ' - '  + period.periodEnd.slice(4, 10));
        } else if (this.periodUnit === 'month') {
            this.data.forEach((period, i, arr) => arr[i].periodStart = period.periodStart.slice(4, 7))
        }
    }
}