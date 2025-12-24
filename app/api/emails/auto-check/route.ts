import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';
import { checkForReplies } from '@/lib/imap';
import mongoose from 'mongoose';

// Helper function to notify via Socket.IO
function notifyNewReply(userId: string, emailData: any) {
  if (typeof global !== 'undefined' && (global as any).io) {
    (global as any).io.to(`user-${userId}`).emit('new-reply', emailData);
  }
}

// GET - Auto-check for replies (can be called by cron job)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_API_KEY || 'your-secret-cron-key';
    
    // Simple API key authentication for cron jobs
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { emails: newEmails } = await checkForReplies();
    
    if (newEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new replies found',
        processed: 0,
      });
    }

    let processed = 0;
    const errors: string[] = [];

    // Get all users who have sent emails
    const usersWithEmails = await Email.distinct('userId');

    for (const email of newEmails) {
      try {
        const fromEmail = email.from?.value?.[0]?.address || email.from?.text || '';
        const emailAddress = fromEmail.toLowerCase();
        
        // Find original email for any user (check all emails, not just those without replies)
        const originalEmail = await Email.findOne({
          toEmail: emailAddress,
        }).sort({ sentAt: -1 });

        if (originalEmail) {
          const subject = email.subject || '';
          const isReply = email.inReplyTo || 
                         (email.references && email.references.length > 0) ||
                         subject.toLowerCase().startsWith('re:') ||
                         subject.toLowerCase().startsWith('re :');

          if (isReply) {
            const newReplyDate = email.date || new Date();
            const isNewReply = !originalEmail.replyReceived || 
                              !originalEmail.replyAt ||
                              new Date(newReplyDate).getTime() > new Date(originalEmail.replyAt).getTime();
            
            if (isNewReply) {
              originalEmail.replyReceived = true;
              originalEmail.replyAt = newReplyDate;
              originalEmail.replyContent = email.text || email.html || email.textAsHtml || '';
              
              // Store the incoming reply's Message-ID for threading
              if (email.messageId) {
                originalEmail.replyMessageId = email.messageId.replace(/[<>]/g, '');
              }
              
              // If original email doesn't have a messageId, try to extract from reply's inReplyTo
              if (!originalEmail.messageId && email.inReplyTo) {
                const inReplyToMsgId = Array.isArray(email.inReplyTo) 
                  ? email.inReplyTo[0] 
                  : email.inReplyTo;
                if (inReplyToMsgId) {
                  originalEmail.messageId = inReplyToMsgId.replace(/[<>]/g, '');
                }
              }
              
              // If original email doesn't have a messageId, try to extract from reply's inReplyTo
              if (!originalEmail.messageId && email.inReplyTo) {
                const inReplyToValue = Array.isArray(email.inReplyTo) ? email.inReplyTo[0] : email.inReplyTo;
                if (inReplyToValue) {
                  originalEmail.messageId = inReplyToValue.replace(/[<>]/g, '');
                }
              }
              
              // Also check references if inReplyTo didn't work
              if (!originalEmail.messageId && email.references && Array.isArray(email.references) && email.references.length > 0) {
                const firstRef = email.references[0];
                originalEmail.messageId = firstRef.replace(/[<>]/g, '');
              }
              
              await originalEmail.save();
              
              // Note: Incoming replies stay in Inbox (not copied to Sent folder)
              // The mail server handles threading automatically based on Message-ID headers
              
              // Notify user via Socket.IO
              notifyNewReply(originalEmail.userId.toString(), {
                emailId: originalEmail._id.toString(),
                driverName: originalEmail.driverName,
                driverMcNo: originalEmail.driverMcNo,
                subject: originalEmail.subject,
                replyContent: originalEmail.replyContent,
                replyAt: originalEmail.replyAt,
              });
              
              processed++;
            }
          }
        }
      } catch (error: any) {
        const fromEmail = email.from?.value?.[0]?.address || email.from?.text || 'unknown';
        errors.push(`Error processing email from ${fromEmail}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} reply(ies)`,
      processed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error in auto-check replies:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check for replies' },
      { status: 500 }
    );
  }
}

