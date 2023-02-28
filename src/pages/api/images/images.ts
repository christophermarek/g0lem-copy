import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!prisma) return res.status(400).send('prisma not defined');
  const { state, code } = req.query;

  return res.status(200).json({ ok: true });
}
