export function hasStarted(dateTime) {
    const startDate = new Date(dateTime.replace(' ', 'T'));
    const now = new Date();

    if (startDate <= now) {
        return true;
    } else {
        return false;
    }
}

export function hasEnded(dateTime) {
    const endDate = new Date(dateTime.replace(' ', 'T'));
    endDate.setMinutes(endDate.getMinutes() + 30);
    const now = new Date();

    if (endDate <= now) {
        return true;
    } else {
        return false;
    }
}