module.exports = function getNextItemOccurence(date, recurrence) {
    const today = new Date();
    const daysUntilNextByRecurrence= [
        {
            recurrence: 'daily',
            quantity: 1
        },
        {
            recurrence: 'weekly',
            quantity: 7
        },
        {
            recurrence: 'monthly',
            quantity: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        },
        {
            recurrence: 'yearly',
            quantity: 365
        }
    ]
    let daysUntilNext = daysUntilNextByRecurrence.find((obj) => obj.recurrence === recurrence).quantity;

    date.setDate(date.getDate() + daysUntilNext);

    return date;
}   