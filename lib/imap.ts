const Imap = require('imap');
import { simpleParser, ParsedMail } from 'mailparser';

interface ImapConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

export async function checkForReplies(): Promise<{ emails: ParsedMail[]; messageIds: number[] }> {
  return new Promise((resolve, reject) => {
    const config: ImapConfig = {
      user: process.env.IMAP_USER || '',
      password: process.env.IMAP_PASS || '',
      host: process.env.IMAP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
    };

    if (!config.user || !config.password) {
      console.log('IMAP not configured, skipping email check');
      resolve({ emails: [], messageIds: [] });
      return;
    }

    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
    });

    const emails: ParsedMail[] = [];
    const messageIds: number[] = [];
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error('IMAP connection timeout while checking for replies');
      imap.end();
      resolve({ emails: [], messageIds: [] }); // Return empty instead of rejecting
    }, 30000); // 30 second timeout

    imap.once('ready', () => {
      clearTimeout(timeout);
        imap.openBox('INBOX', false, (err: Error | null, box: any) => {
        if (err) {
          clearTimeout(timeout);
          console.error('Error opening inbox:', err);
          console.error('Error message:', err.message);
          imap.end();
          // Don't reject - return empty array instead
          resolve({ emails: [], messageIds: [] });
          return;
        }

        // Search for unread emails from the last 7 days only
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        imap.search(['UNSEEN', ['SINCE', weekAgo]], (err: Error | null, results: number[]) => {
          if (err) {
            clearTimeout(timeout);
            console.error('Error searching emails:', err);
            console.error('Error message:', err.message);
            imap.end();
            // Don't reject - return empty array instead
            resolve({ emails: [], messageIds: [] });
            return;
          }

          if (!results || results.length === 0) {
            imap.end();
            resolve({ emails: [], messageIds: [] });
            return;
          }

          const fetch = imap.fetch(results, { bodies: '' });
          let processed = 0;

          fetch.on('message', (msg: any, seqno: number) => {
            msg.on('body', (stream: NodeJS.ReadableStream, info: any) => {
              simpleParser(stream as any, (err: Error | null, parsed: ParsedMail) => {
                if (err) {
                  console.error('Error parsing email:', err);
                  processed++;
                  if (processed === results.length) {
                    // Mark all processed emails as seen
                    if (results.length > 0) {
                      imap.addFlags(results, '\\Seen', (markErr: Error | null) => {
                        if (markErr) {
                          console.error('Error marking emails as seen:', markErr);
                        } else {
                          console.log(`Marked ${results.length} email(s) as seen`);
                        }
                        imap.end();
                        resolve({ emails, messageIds: results });
                      });
                    } else {
                      imap.end();
                      resolve({ emails, messageIds: results });
                    }
                  }
                  return;
                }

                emails.push(parsed);
                messageIds.push(seqno);

                processed++;
                if (processed === results.length) {
                  // Mark all processed emails as seen to prevent showing as new again
                  if (results.length > 0) {
                    imap.addFlags(results, '\\Seen', (markErr: Error | null) => {
                      if (markErr) {
                        console.error('Error marking emails as seen:', markErr);
                      } else {
                        console.log(`Marked ${results.length} email(s) as seen`);
                      }
                      imap.end();
                      resolve({ emails, messageIds: results });
                    });
                  } else {
                    imap.end();
                    resolve({ emails, messageIds: results });
                  }
                }
              });
            });
          });

          fetch.once('error', (err: Error) => {
            clearTimeout(timeout);
            console.error('Error fetching emails:', err);
            console.error('Error message:', err.message);
            imap.end();
            // Don't reject - return empty array instead
            resolve({ emails: [], messageIds: [] });
          });
        });
      });
    });

    imap.once('error', (err: Error) => {
      clearTimeout(timeout);
      console.error('IMAP error:', err);
      console.error('Error message:', err.message);
      // Don't reject - return empty array instead to prevent 500 errors
      resolve({ emails: [], messageIds: [] });
    });

    console.log('Connecting to IMAP to check for replies...');
    imap.connect();
  });
}

// Save sent email to IMAP Sent folder
export async function saveToSentFolder(emailContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const config: ImapConfig = {
      user: process.env.IMAP_USER || '',
      password: process.env.IMAP_PASS || '',
      host: process.env.IMAP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
    };

    if (!config.user || !config.password) {
      console.log('IMAP not configured, skipping save to sent folder');
      resolve();
      return;
    }

    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
    });

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error('IMAP connection timeout while saving to Sent folder');
      imap.end();
      resolve();
    }, 30000); // 30 second timeout

    imap.once('ready', () => {
      clearTimeout(timeout);
      console.log('IMAP connected, opening Sent folder...');
      // Try to open Sent folder first
      imap.openBox('Sent', true, (err: Error | null, box: any) => {
        if (err) {
          console.log('Sent folder not found, trying Sent Items...');
          // If Sent folder doesn't exist, try Sent Items
          imap.openBox('Sent Items', true, (err2: Error | null, box2: any) => {
            if (err2) {
              console.error('❌ Error opening Sent folder:', err2);
              console.error('Tried both "Sent" and "Sent Items" folders');
              console.error('Error message:', err2.message);
              imap.end();
              resolve(); // Don't fail the email send if we can't save to sent folder
              return;
            }
            console.log('✓ Opened Sent Items folder successfully');
            appendEmail('Sent Items');
          });
          return;
        }
        console.log('✓ Opened Sent folder successfully');
        appendEmail('Sent');
      });
    });

    const appendEmail = (mailbox: string) => {
      try {
        // Ensure email content ends with proper line breaks
        const finalContent = emailContent.endsWith('\r\n') ? emailContent : emailContent + '\r\n';
        const buffer = Buffer.from(finalContent, 'utf8');
        
        // Set flags to mark as sent message
        // \\Seen = read, \\Recent = recently added
        const flags = ['\\Seen'];
        
        console.log(`Appending email to ${mailbox} folder (${buffer.length} bytes)...`);
        console.log(`Email content preview (first 200 chars): ${emailContent.substring(0, 200)}...`);
        imap.append(buffer, { mailbox, flags }, (err: Error | null) => {
          if (err) {
            console.error(`❌ Error appending to ${mailbox} folder:`, err);
            console.error('Error details:', {
              message: err.message,
              code: (err as any).code,
              syscall: (err as any).syscall
            });
            imap.end();
            resolve(); // Don't fail the email send if we can't save to sent folder
            return;
          }
          console.log(`✓ Email successfully saved to ${mailbox} folder`);
          imap.end();
          resolve();
        });
      } catch (error: any) {
        console.error('Error preparing email for append:', error);
        imap.end();
        resolve();
      }
    };

    imap.once('error', (err: Error) => {
      clearTimeout(timeout);
      console.error('❌ IMAP error while saving to sent:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      imap.end();
      resolve(); // Don't fail the email send if we can't save to sent folder
    });

    console.log('Connecting to IMAP server...');
    imap.connect();
  });
}

// Copy incoming reply to Sent folder so it appears in the conversation thread
// We reconstruct the email in the proper format for the Sent folder
export async function copyReplyToSentFolder(
  email: ParsedMail,
  originalMessageId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const config: ImapConfig = {
      user: process.env.IMAP_USER || '',
      password: process.env.IMAP_PASS || '',
      host: process.env.IMAP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
    };

    if (!config.user || !config.password) {
      console.log('IMAP not configured, skipping copy reply to sent folder');
      resolve();
      return;
    }

    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
    });

    imap.once('ready', () => {
      console.log('IMAP connected for copying reply, opening Sent folder...');
      // Open Sent folder
      imap.openBox('Sent', true, (err: Error | null, box: any) => {
        if (err) {
          console.log('Sent folder not found, trying Sent Items...');
          // Try Sent Items
          imap.openBox('Sent Items', true, (err2: Error | null) => {
            if (err2) {
              console.error('Error opening Sent folder for copy:', err2);
              imap.end();
              resolve();
              return;
            }
            console.log('Opened Sent Items folder for reply copy');
            appendReply('Sent Items');
          });
          return;
        }
        console.log('Opened Sent folder for reply copy');
        appendReply('Sent');
      });
    });

    const appendReply = (mailbox: string) => {
      try {
        // Reconstruct the email in proper format for Sent folder
        // The reply should appear as if it was received (for threading purposes)
        const fromEmail = email.from?.value?.[0]?.address || email.from?.text || '';
        const toEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'booking@skywholelogistics.us';
        const subject = email.subject || '';
        const dateHeader = email.date ? email.date.toUTCString() : new Date().toUTCString();
        const replyMessageId = email.messageId || `<${Date.now()}-${Math.random().toString(36).substring(7)}@reply>`;
        
        // Get email content (prefer HTML, fallback to text)
        let emailBody = email.html || email.text || email.textAsHtml || '';
        
        // If we have text but no HTML, create a simple HTML version
        if (!email.html && email.text) {
          emailBody = email.text.replace(/\n/g, '<br>');
        }
        
        // Build References chain from email's existing references if available
        let referencesChain = '';
        if (email.references && Array.isArray(email.references) && email.references.length > 0) {
          referencesChain = email.references.map((ref: string) => {
            return ref.startsWith('<') ? ref : `<${ref}>`;
          }).join(' ');
        } else if (originalMessageId) {
          // Fallback to just the original message ID
          const formattedMsgId = originalMessageId.startsWith('<') ? originalMessageId : `<${originalMessageId}>`;
          referencesChain = formattedMsgId;
        }
        
        // Construct RFC 2822 formatted email
        let emailContent = `From: ${fromEmail}\r\n` +
          `To: ${toEmail}\r\n` +
          `Subject: ${subject}\r\n` +
          `Date: ${dateHeader}\r\n` +
          `Message-ID: ${replyMessageId}\r\n`;
        
        // Add threading headers - use the original message ID for In-Reply-To
        if (originalMessageId) {
          const formattedMsgId = originalMessageId.startsWith('<') ? originalMessageId : `<${originalMessageId}>`;
          emailContent += `In-Reply-To: ${formattedMsgId}\r\n`;
        }
        
        // Add References header with full chain
        if (referencesChain) {
          emailContent += `References: ${referencesChain}\r\n`;
        }
        
        // Use base64 encoding (same as sent emails for consistency)
        const htmlBuffer = Buffer.from(emailBody, 'utf8');
        const encodedHtml = htmlBuffer.toString('base64');
        const wrappedHtml = encodedHtml.match(/.{1,76}/g)?.join('\r\n') || encodedHtml;
        
        emailContent += `MIME-Version: 1.0\r\n` +
          `Content-Type: text/html; charset=utf-8\r\n` +
          `Content-Transfer-Encoding: base64\r\n\r\n` +
          wrappedHtml;
        
        // Ensure email content ends with proper line breaks
        const finalContent = emailContent.endsWith('\r\n') ? emailContent : emailContent + '\r\n';
        console.log(`Copying reply to ${mailbox} folder (${finalContent.length} bytes)...`);
        console.log(`Reply details: From=${fromEmail}, To=${toEmail}, Subject=${subject}`);
        console.log(`Threading: In-Reply-To=${originalMessageId}`);
        
        const buffer = Buffer.from(finalContent, 'utf8');
        const flags = ['\\Seen']; // Mark as read
        imap.append(buffer, { mailbox, flags }, (appendErr: Error | null) => {
          if (appendErr) {
            console.error(`❌ Error copying reply to ${mailbox} folder:`, appendErr);
            console.error('Error details:', {
              message: appendErr.message,
              code: (appendErr as any).code,
              syscall: (appendErr as any).syscall
            });
            // Still resolve - don't fail the whole process
            resolve();
          } else {
            console.log(`✓ Reply successfully copied to ${mailbox} folder for threading`);
            resolve();
          }
          imap.end();
        });
      } catch (error: any) {
        console.error('Error preparing reply for copy:', error);
        imap.end();
        resolve();
      }
    };

    imap.once('error', (err: Error) => {
      console.error('❌ IMAP error while copying reply to sent:', err);
      console.error('IMAP error details:', {
        message: err.message,
        code: (err as any).code
      });
      imap.end();
      resolve(); // Still resolve - don't fail the whole process
    });

    imap.connect();
  });
}
