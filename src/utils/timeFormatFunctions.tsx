import Decimal from "decimal.js";

export function formatDate(date: Date) {
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
};

export function calculateDuration(start: Date, end: Date | null) {
    const startTime = new Decimal(new Date(start).getTime()).div(60000).floor().mul(60000);
    const endTime = end ? new Decimal(new Date(end).getTime()).div(60000).floor().mul(60000) : Date.now();
    const durationInMinutes = new Decimal(endTime).minus(startTime).div(60000);
    const totalHours = durationInMinutes.div(60).trunc();
    const minutesRemaining = totalHours.isZero() ? durationInMinutes.trunc() : durationInMinutes.minus(totalHours.mul(60)).trunc();
    return `${totalHours}h ${minutesRemaining}m`;
};


export function calculateTotalHours(totalInMinutes: Decimal) {
    const hours = new Decimal(totalInMinutes).div(60).trunc();
    const minutes = hours.isZero() ? new Decimal(totalInMinutes).trunc() : new Decimal(totalInMinutes).minus(hours.mul(60)).trunc();
    return `${hours}h ${minutes}m`;
};