export class Booking {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly createdAt: Date = new Date(),
  ) {}

  conflictsWith(other: Booking): boolean {
    return (
      this.startTime.getTime() < other.endTime.getTime() &&
      other.startTime.getTime() < this.endTime.getTime()
    );
  }
}
