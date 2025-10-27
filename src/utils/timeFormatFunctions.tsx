export function formatDate(date: Date) {
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
};

export function calculateDuration(start: Date, end: Date | null) {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const durationInMinutes = Math.floor((endTime - startTime) / 60000);
    return `${durationInMinutes >= 60 ? Math.floor(durationInMinutes / 60) + "h": ""} ${durationInMinutes % 60}m`;
};

export function calculateTotalHours(totalInMinutes: number) {
    const hours = Math.floor(totalInMinutes / 60);
    const minutes = totalInMinutes % 60;
    return `${hours}h ${minutes.toFixed(0)}m`;
};