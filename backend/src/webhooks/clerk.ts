import { Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../db/db';

export const clerkWebhook = async (req: Request, res: Response): Promise<any> => {
  // Verify webhook signature
  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;
  
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing Svix headers');
    return res.status(400).json({ error: 'Missing Svix headers' });
  }

  // Get the webhook body
  const rawBody = req.body as Buffer;
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not defined');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Initialize the Svix webhook verifier
    const wh = new Webhook(webhookSecret);
    
    // Verify the webhook payload
    const evt = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as { type: string, data: any };

    // Process the event based on type
    const { type, data } = evt;
    console.log(`Webhook received: ${type}`);
    
    if (type === 'user.created') {
      await handleUserCreated(data);
    } else if (type === 'user.updated') {
      await handleUserUpdated(data);
    } else if (type === 'user.deleted') {
      await handleUserDeleted(data);
    }

     res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }
};

// Handler for user.created events
async function handleUserCreated(data: any) {
  console.log('Processing user.created webhook:', data.id);
  
  try {
    // Find primary email from the Clerk user data
    const primaryEmail = data.email_addresses?.find(
      (email: any) => email.id === data.primary_email_address_id
    );
    
    if (!primaryEmail?.email_address) {
      console.error('No primary email found for user:', data.id);
      return;
    }

    // Prepare name - use username if first_name/last_name are null
    let name = null;
    if (data.first_name || data.last_name) {
      name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    } else if (data.username) {
      name = data.username;
    }

    // Convert timestamp to Date if it's a number
    const createdAtDate = typeof data.created_at === 'number' 
      ? new Date(data.created_at)
      : new Date(data.created_at || Date.now());

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        clerkUserId: data.id,
        email: primaryEmail.email_address,
        name: name,
        image: data.image_url || data.profile_image_url || null,  // Fallback to profile_image_url
        createdAt: createdAtDate,
        updatedAt: new Date()
      }
    });

    console.log('User successfully created in database:', user.id);
    return user;
  } catch (error: any) {
    console.error('Error creating user in database:', error);
    
    // If user already exists (unique constraint violation)
    if (error.code === 'P2002') {
      console.log('User already exists, attempting update instead');
      return await handleUserUpdated(data);
    }
    
    throw error;
  }
}

// Handler for user.updated events
async function handleUserUpdated(data: any) {
  console.log('Processing user.updated webhook:', data.id);
  
  try {
    const primaryEmail = data.email_addresses?.find(
      (email: any) => email.id === data.primary_email_address_id
    )?.email_address;
    
    const user = await prisma.user.upsert({
      where: { clerkUserId: data.id },
      update: {
        email: primaryEmail || undefined,
        name: data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}` 
          : (data.first_name || data.last_name || undefined),
        image: data.image_url || undefined,
        updatedAt: new Date()
      },
      create: {
        clerkUserId: data.id,
        email: primaryEmail || 'unverified@example.com', // Fallback
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
        image: data.image_url || null,
        createdAt: new Date(data.created_at || Date.now()),
        updatedAt: new Date()
      }
    });
    
    console.log('User updated in database:', user.id);
    return user;
  } catch (error) {
    console.error('Error updating user in database:', error);
    throw error;
  }
}

// Handler for user.deleted events
async function handleUserDeleted(data: any) {
  console.log('Processing user.deleted webhook:', data.id);
  
  try {
    await prisma.user.delete({
      where: { clerkUserId: data.id }
    });
    
    console.log('User deleted from database:', data.id);
  } catch (error) {
    console.error('Error deleting user from database:', error);
    // If user doesn't exist, that's fine - it's already deleted
    if ((error as any).code !== 'P2025') { // Record not found error
      throw error;
    }
  }
}