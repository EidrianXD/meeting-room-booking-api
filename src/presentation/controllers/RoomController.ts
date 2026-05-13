import type { Request, Response, NextFunction } from "express";
import { Room } from "../../domain/entities/Room";

export type ListRooms = () => Promise<Room[]>;

export class RoomController {
  constructor(private readonly listRooms: ListRooms) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rooms = await this.listRooms();
      res.status(200).json(rooms);
    } catch (err) {
      next(err);
    }
  };
}
