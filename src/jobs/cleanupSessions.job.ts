import { getRepository } from 'typeorm';
import { Session } from '../models/Session';

export const cleanupSessionsJob = async (): Promise<void> => {
  try {
    const sessionRepository = getRepository(Session);
    const now = new Date();
    const result = await sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('expiresAt < :now', { now })
      .execute();

    console.log(`Cleaned up ${result.affected} expired sessions.`);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
};
