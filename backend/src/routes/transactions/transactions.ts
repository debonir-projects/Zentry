import { Request as ExpressRequest, Response } from 'express';
import prisma from '../../db/db';

interface Request extends ExpressRequest {
  auth: {
    userId: string;
    id?: string;
  };
  query: {
    startDate?: string;
    endDate?: string;
  };
  body: {
    text?: string;
    amount?: number | string;
    memories?: {
      title?: string;
      description?: string;
      imageUrl?: string | null;
    }[];
  };
}
export async function postTransactionById(req: Request, res: Response): Promise<any> {
  try {
    const { userId } = req.auth;
    const { text, amount, memories = [] } = req.body;

    const userExists = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!userExists) return res.status(404).json({ error: "User not found" });

    if (!text || typeof text !== 'string')
      return res.status(400).json({ error: "Transaction text is required" });

    if (amount === undefined || isNaN(Number(amount)))
      return res.status(400).json({ error: "Valid transaction amount is required" });

    const transaction = await prisma.transaction.create({
      data: {
        text,
        amount: parseFloat(String(amount)),
        
        userId,
        memories: {
          create: memories.map((memory) => ({
            title: memory.title || 'Untitled',
            description: memory.description || '',
            imageUrl: memory.imageUrl || null,
            userId
          })),
        },
      },
      include: { memories: true },
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
}


export async function getAllUsersTransactions(req: Request, res: Response): Promise<any> {
  try {
    const { userId } = req.auth;
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter = {
        createdAt: {
          ...(startDate && { gte: new Date(startDate as string) }),
          ...(endDate && { lte: new Date(endDate as string) }),
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId, // Add this to filter by the authenticated user
        ...dateFilter,
      },
      include: {
        memories: true,
        user: {
          select: {
            clerkUserId: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}
/**
 * Get a transaction by ID
 */
export async function getTransactionById(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.auth.userId;
    const id = req.params.id;
    if (!userId || !id) return res.status(400).json({ error: "Missing parameters" });

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { memories: true },
    });

    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    if (transaction.userId !== userId)
      return res.status(403).json({ error: "Forbidden - transaction belongs to another user" });

    res.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
}

/**
 * Update a transaction
 */
export async function updateTransactionById(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.auth.userId;
    const id = req.params.id; // Get ID from params, not auth
    const { text, amount,  } = req.body; // Add category

    if (!userId || !id) return res.status(400).json({ error: "Missing parameters" });

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    if (transaction.userId !== userId)
      return res.status(403).json({ error: "Forbidden - transaction belongs to another user" });

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(text && { text }),
        ...(amount !== undefined && { amount: parseFloat(String(amount)) }),
       
      },
      include: { memories: true },
    });

    res.json({ success: true, transaction: updated });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransactionById(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.auth.userId;
    const id = req.params.id; // Get ID from params, not auth

    if (!userId || !id) return res.status(400).json({ error: "Missing parameters" });

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    if (transaction.userId !== userId)
      return res.status(403).json({ error: "Forbidden - transaction belongs to another user" });

    await prisma.transaction.delete({ where: { id } });

    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
}