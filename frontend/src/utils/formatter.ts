export const formatDuration = (durationInSeconds: number) => {
    const totalSeconds = Math.round(durationInSeconds)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${String(seconds).padStart(2, '0')}`
}