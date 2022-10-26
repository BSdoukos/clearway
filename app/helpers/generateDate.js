module.exports = function generateDate(str) {
    let dateParts = str.split('-');
    date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    return date;
}