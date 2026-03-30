
export default function formatTimeDate(input: string) {
    const updatedAt = new Date(input);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const drawDate = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), updatedAt.getDate());

    const isToday = drawDate.getTime() === today.getTime();
    const isYesterday = drawDate.getTime() === yesterday.getTime();
    const isSameYear = updatedAt.getFullYear() === now.getFullYear();

    const timeString = updatedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    let dateAndTime = "";
    if (isToday) {
        dateAndTime = `Today at ${timeString}`;
    } else if (isYesterday) {
        dateAndTime = `Yesterday at ${timeString}`;
    } else {
        dateAndTime = updatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            ...(isSameYear ? {} : { year: "numeric" })
        });
    }
    return dateAndTime;
}