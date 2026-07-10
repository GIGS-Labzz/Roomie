import { Injectable } from '@nestjs/common';
import { connection_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NetworkService {
  constructor(private readonly prisma: PrismaService) {}

  async getMutualConnections(userAId: string, userBId: string) {
    const [aConnections, bConnections] = await Promise.all([
      this.prisma.connections.findMany({
        where: {
          status: connection_status.ACTIVE,
          OR: [{ requester_id: userAId }, { receiver_id: userAId }],
        },
        select: { requester_id: true, receiver_id: true },
      }),
      this.prisma.connections.findMany({
        where: {
          status: connection_status.ACTIVE,
          OR: [{ requester_id: userBId }, { receiver_id: userBId }],
        },
        select: { requester_id: true, receiver_id: true },
      }),
    ]);

    const otherIds = (rows: { requester_id: string; receiver_id: string }[], selfId: string) =>
      rows.map((r) => (r.requester_id === selfId ? r.receiver_id : r.requester_id));

    const aIds = otherIds(aConnections, userAId);
    const bIds = new Set(otherIds(bConnections, userBId));

    const mutualIds = aIds.filter((id) => bIds.has(id) && id !== userAId && id !== userBId);

    if (mutualIds.length === 0) return [];

    return this.prisma.profiles.findMany({
      where: { id: { in: mutualIds } },
      select: { id: true, display_name: true, username: true, avatar_url: true },
    });
  }
}
