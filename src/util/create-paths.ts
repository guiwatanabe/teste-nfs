import { mkdir } from 'fs/promises';

export const certificatesDir = 'certificates';

export default async function createPaths(): Promise<void> {
  await mkdir(certificatesDir, { recursive: true });
}
