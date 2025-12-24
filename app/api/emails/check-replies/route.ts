import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';
import { getSession } from '@/lib/getSession';
import { checkForReplies } from '@/lib/imap';
import { ParsedMail } from 'mailparser';
import mongoose from 'mongoose';

// Helper function to notify via Socket.IO
function notifyNewReply(userId: string, emailData: any) {
  if (typeof global !== 'undefined' && (global as any).io) {
    (global as any).io.to(`user-${userId}`).emit('new-reply', emailData);
  }
}

// POST - Check for email replies via IMAP
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Check for new replies via IMAP
    let newEmails: ParsedMail[] = [];
    try {
      const result = await checkForReplies();
      newEmails = result.emails || [];
    } catch (error: any) {
      console.error('Error in checkForReplies:', error);
      // If IMAP fails, return empty result instead of 500 error
      return NextResponse.json({
        success: true,
        message: 'IMAP check failed, but continuing...',
        processed: 0,
        warning: 'Could not connect to mail server to check for replies',
      });
    }
    
    if (newEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new replies found',
        processed: 0,
      });
    }

    let processed = 0;
    const errors: string[] = [];

    for (const email of newEmails) {
      try {
        const fromEmail = email.from?.value?.[0]?.address || email.from?.text || '';
        const emailAddress = fromEmail.toLowerCase();
        
        // Try to find the original email by matching recipient
        // Look for emails sent to the reply sender - check all emails, not just those without replies
        // This allows detecting replies to emails that already have replies
        const originalEmail = await Email.findOne({
          userId,
          toEmail: emailAddress,
        }).sort({ sentAt: -1 });

        if (originalEmail) {
          // Check if this is a reply (has inReplyTo or references, or subject starts with Re:)
          const subject = email.subject || '';
          const isReply = email.inReplyTo || 
                         (email.references && email.references.length > 0) ||
                         subject.toLowerCase().startsWith('re:') ||
                         subject.toLowerCase().startsWith('re :');

          if (isReply) {
            // Check if this is a new reply (not already processed)
            // Compare reply date to see if it's newer than the last one we stored
            const newReplyDate = email.date || new Date();
            const isNewReply = !originalEmail.replyReceived || 
                              !originalEmail.replyAt ||
                              new Date(newReplyDate).getTime() > new Date(originalEmail.replyAt).getTime();
            
            if (isNewReply) {
              originalEmail.replyReceived = true;
              originalEmail.replyAt = newReplyDate;
              originalEmail.replyContent = email.text || email.html || email.textAsHtml || '';
              
              // Store the incoming reply's Message-ID for threading (without angle brackets for storage)
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
                  await originalEmail.save();
                }
              }
              
              // Also check references if inReplyTo didn't work
              if (!originalEmail.messageId && email.references && Array.isArray(email.references) && email.references.length > 0) {
                const firstRef = email.references[0];
                originalEmail.messageId = firstRef.replace(/[<>]/g, '');
                await originalEmail.save();
              }
              
              await originalEmail.save();
              
              // Note: Incoming replies stay in Inbox (not copied to Sent folder)
              // The mail server handles threading automatically based on Message-ID headers
              
              // Notify user via Socket.IO
              notifyNewReply(userId.toString(), {
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
    console.error('Error checking for replies:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check for replies' },
      { status: 500 }
    );
  }
}

