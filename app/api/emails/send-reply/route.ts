import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';
import { getSession } from '@/lib/getSession';
import { sendEmail } from '@/lib/email';
import mongoose from 'mongoose';

// POST - Send reply to an email
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
    const data = await request.json();
    const { emailId, message } = data;

    if (!emailId || !message) {
      return NextResponse.json(
        { error: 'Email ID and message are required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const emailRecord = await Email.findById(emailId);

    if (!emailRecord) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (emailRecord.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create reply email content
    const replySubject = emailRecord.subject.startsWith('Re:') 
      ? emailRecord.subject 
      : `Re: ${emailRecord.subject}`;
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${replySubject}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#ffffff; color:#000000;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:20px;">
        <p>
          ${message.replace(/\n/g, '<br>')}
        </p>
        <p style="margin-top:20px; padding-top:20px; border-top:1px solid #e5e7eb; color:#6b7280; font-size:12px;">
          <strong>Sky Whole Logistics</strong>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
    
    const textContent = `${message}\n\nSky Whole Logistics`;

    // Prepare threading headers for proper email threading
    // Extract the base subject (without Re: prefixes) for finding thread
    const baseSubject = emailRecord.subject.replace(/^Re:\s*/gi, '').trim();
    
    // Build References chain: find all emails in this thread
    // Match by same toEmail and same base subject
    const threadEmails = await Email.find({
      userId,
      toEmail: emailRecord.toEmail,
      $or: [
        { subject: { $regex: new RegExp(`^Re:\\s*${baseSubject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { subject: { $regex: new RegExp(`^${baseSubject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      ],
    }).sort({ sentAt: 1 }); // Sort chronologically
    
    // Build References chain with all Message-IDs in the thread
    const referencesChain: string[] = [];
    for (const threadEmail of threadEmails) {
      // Add the sent email's Message-ID
      if (threadEmail.messageId) {
        let msgId = threadEmail.messageId;
        if (!msgId.startsWith('<')) {
          msgId = `<${msgId}>`;
        }
        if (!referencesChain.includes(msgId)) {
          referencesChain.push(msgId);
        }
      }
      // Also add the incoming reply's Message-ID if it exists (for proper threading)
      if (threadEmail.replyMessageId) {
        let replyMsgId = threadEmail.replyMessageId;
        if (!replyMsgId.startsWith('<')) {
          replyMsgId = `<${replyMsgId}>`;
        }
        if (!referencesChain.includes(replyMsgId)) {
          referencesChain.push(replyMsgId);
        }
      }
    }
    
    // If we're replying to an email that received a reply, use the incoming reply's Message-ID
    let inReplyToMessageId: string | undefined;
    if (emailRecord.replyMessageId) {
      // We're replying to an incoming reply
      inReplyToMessageId = emailRecord.replyMessageId;
    } else if (emailRecord.messageId) {
      // We're replying to our own sent email
      inReplyToMessageId = emailRecord.messageId;
    }
    
    // Format Message-ID with angle brackets
    if (inReplyToMessageId && !inReplyToMessageId.startsWith('<')) {
      inReplyToMessageId = `<${inReplyToMessageId}>`;
    }
    
    // In-Reply-To should point to the most recent message (incoming reply if exists, otherwise our sent email)
    const inReplyTo = inReplyToMessageId || (referencesChain.length > 0 ? referencesChain[referencesChain.length - 1] : undefined);
    
    // References should include the full chain (all previous Message-IDs in chronological order)
    const references = referencesChain.length > 0 ? referencesChain.join(' ') : inReplyToMessageId || undefined;

    // Send reply email with threading headers
    const result = await sendEmail(
      emailRecord.toEmail,
      replySubject,
      htmlContent,
      textContent,
      {
        inReplyTo,
        references,
      }
    );

    // Save reply as a new email record with parent reference
    const replyEmailRecord = new Email({
      userId,
      driverId: emailRecord.driverId,
      driverName: emailRecord.driverName,
      driverMcNo: emailRecord.driverMcNo,
      toEmail: emailRecord.toEmail,
      subject: replySubject,
      sentAt: new Date(),
      status: 'sent',
      messageId: result.messageId || undefined,
      parentEmailId: emailRecord._id, // Track which email this is replying to
    });
    await replyEmailRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      emailId: replyEmailRecord._id.toString(),
    });
  } catch (error: any) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reply' },
      { status: 500 }
    );
  }
}

