export class Booking {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly createdAt: Date = new Date(),
  ) {
    if (Number.isNaN(startTime.getTime())) {
      throw new Error("Booking.startTime: data inválida.");
    }
    if (Number.isNaN(endTime.getTime())) {
      throw new Error("Booking.endTime: data inválida.");
    }
  }

  conflictsWith(other: Booking): boolean {
    if (this.roomId !== other.roomId) return false;
    return (
      this.startTime.getTime() < other.endTime.getTime() &&
      other.startTime.getTime() < this.endTime.getTime()
    );
  }
}
