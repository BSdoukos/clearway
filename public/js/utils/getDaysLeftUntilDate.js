export default function getDaysLeftUntilDate(date) {
    if (date) {
        const today = Date.now();
        const dateMs = date.getTime();
        const leftDays = (dateMs - today) / (1000 * 60 * 60 * 24);

        return Number.isInteger(parseFloat(leftDays.toFixed(1))) ? Math.round(leftDays) : leftDays.toFixed(1);
    }
}