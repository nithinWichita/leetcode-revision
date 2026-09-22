export function getDailyBatch(): number[] {
    const savedBatch = localStorage.getItem("dailyBatch");

    if (!savedBatch) {
        return [];
    }

    try {
        const parsed = JSON.parse(savedBatch);

        if (
            !Array.isArray(parsed) ||
            !parsed.every((id) => typeof id === "number")
        ) {
            return [];
        }

        return parsed;
    } catch {
        return [];
    }
}