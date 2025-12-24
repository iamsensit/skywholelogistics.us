'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  IdentificationIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface EmailRecord {
  id: string;
  driverId: string;
  driverName: string;
  driverMcNo: string;
  toEmail: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  replyReceived: boolean;
  replyAt?: string;
  replyContent?: string;
  parentEmailId?: string; // ID of the email this is replying to
}

export default function SentEmailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingReplies, setCheckingReplies] = useState(false);
  const [filter, setFilter] = useState<'all' | 'with-replies' | 'no-replies'>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<EmailRecord | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [unseenRepliesCount, setUnseenRepliesCount] = useState(0);
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<string | null>(null);
  const [deleteConfirmDriver, setDeleteConfirmDriver] = useState<{ driverId: string; driverName: string; driverMcNo: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadEmails();
      
      // Set up Socket.IO listener for new replies
      const socket = (window as any).socket;
      if (socket) {
        const handleNewReply = (data: any) => {
          setToastMessage(`New reply received from ${data.driverName}!`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
          
          // Update unseen replies count
          setUnseenRepliesCount(prev => prev + 1);
          
          // Show desktop notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Email Reply - SkyWhole Logistics', {
              body: `Reply from ${data.driverName} (MC: ${data.driverMcNo})\n${data.subject}`,
              icon: '/swl logo.png',
              tag: `reply-${data.emailId}`,
            });
          }
          
          loadEmails(); // Reload to show new reply
        };
        
        socket.on('new-reply', handleNewReply);
        
        return () => {
          socket.off('new-reply', handleNewReply);
        };
      }
    }
  }, [status, router, filter]);

  // Automatic reply checking every 1 minute
  useEffect(() => {
    if (status !== 'authenticated' || !autoCheckEnabled) return;

    // Initial check after 10 seconds
    const initialTimeout = setTimeout(() => {
      handleCheckReplies(true); // Silent check
    }, 10000);

    // Then check every 1 minute
    const interval = setInterval(() => {
      handleCheckReplies(true); // Silent check - only show toast if replies found
    }, 60 * 1000); // 1 minute

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [status, autoCheckEnabled]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const url = filter === 'with-replies' 
        ? '/api/emails?hasReply=true'
        : '/api/emails';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let filteredData = data;
        if (filter === 'no-replies') {
          filteredData = data.filter((e: EmailRecord) => !e.replyReceived);
        }
        setEmails(filteredData);
        
        // Count unseen replies (replies received in last 10 minutes that haven't been viewed)
        // Only count if email is not expanded
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const unseen = filteredData.filter((e: EmailRecord) => {
          if (!e.replyReceived || !e.replyAt) return false;
          if (expandedEmails.has(e.id)) return false; // Don't count if already expanded
          return new Date(e.replyAt) > tenMinutesAgo;
        }).length;
        setUnseenRepliesCount(unseen);
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckReplies = async (silent = false) => {
    try {
      setCheckingReplies(true);
      const res = await fetch('/api/emails/check-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.processed > 0) {
        // Always show notification when replies are found (even in silent mode)
        setToastMessage(`Found ${data.processed} new reply(ies)!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        await loadEmails(); // Reload to show new replies
      } else if (!silent) {
        // Only show "no new replies" if manually checking
        setToastMessage('No new replies found');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        await loadEmails(); // Still reload to ensure we have latest data
      } else {
        // Silent check with no new replies - just refresh silently
        await loadEmails();
      }
    } catch (error) {
      console.error('Error checking replies:', error);
      if (!silent) {
        setToastMessage('Failed to check for replies');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } finally {
      setCheckingReplies(false);
    }
  };

  const handleReply = (email: EmailRecord) => {
    setReplyingTo(email);
    setReplyMessage('');
  };

  const handleSendReply = async () => {
    if (!replyingTo || !replyMessage.trim()) {
      setToastMessage('Please enter a reply message');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // Close modal immediately
    const replyMessageToSend = replyMessage.trim();
    const emailIdToReply = replyingTo.id;
    setReplyingTo(null);
    setReplyMessage('');

    // Send reply in background
    fetch('/api/emails/send-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailId: emailIdToReply,
        message: replyMessageToSend,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setToastMessage('Reply sent successfully!');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
          await loadEmails();
        } else {
          setToastMessage(`Error: ${data.error || 'Failed to send reply'}`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
      })
      .catch((error) => {
        console.error('Error sending reply:', error);
        setToastMessage('Failed to send reply');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      });
  };

  const handleDeleteDriverEmails = async (driverId: string, driverName: string, driverMcNo: string) => {
    try {
      setDeletingDriver(driverId);
      const res = await fetch(`/api/emails/delete?driverId=${driverId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(`Deleted ${data.deletedCount} email(s) for ${driverName}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        
        // Clear selection if deleting selected driver
        const driverKey = `${driverId}-${driverMcNo}`;
        if (selectedDriver === driverKey) {
          setSelectedDriver(null);
        }
        
        await loadEmails();
      } else {
        setToastMessage(`Error: ${data.error || 'Failed to delete emails'}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
      setToastMessage('Failed to delete emails');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setDeletingDriver(null);
      setDeleteConfirmDriver(null);
    }
  };

  // Calculate counts (before any early returns)
  const sentCount = emails.filter(e => e.status === 'sent').length;
  const failedCount = emails.filter(e => e.status === 'failed').length;
  const repliesCount = emails.filter(e => e.replyReceived).length;

  // Group emails by driver using useMemo to avoid recalculating on every render
  // MUST be called before any conditional returns to maintain hook order
  const driverGroups = useMemo(() => {
    const groupedByDriver = emails.reduce((acc, email) => {
      const driverKey = `${email.driverId}-${email.driverMcNo}`;
      if (!acc[driverKey]) {
        acc[driverKey] = {
          driverId: email.driverId,
          driverName: email.driverName,
          driverMcNo: email.driverMcNo,
          toEmail: email.toEmail,
          emails: [],
        };
      }
      acc[driverKey].emails.push(email);
      return acc;
    }, {} as Record<string, {
      driverId: string;
      driverName: string;
      driverMcNo: string;
      toEmail: string;
      emails: EmailRecord[];
    }>);

    // Sort emails within each group by date (newest first)
    Object.values(groupedByDriver).forEach(group => {
      group.emails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    });

    // Sort driver groups by most recent email
    return Object.values(groupedByDriver).sort((a, b) => {
      const aLatest = new Date(a.emails[0]?.sentAt || 0).getTime();
      const bLatest = new Date(b.emails[0]?.sentAt || 0).getTime();
      return bLatest - aLatest;
    });
  }, [emails]);

  // Auto-select first driver if none selected
  useEffect(() => {
    if (driverGroups.length > 0 && !selectedDriver) {
      const firstDriverKey = `${driverGroups[0].driverId}-${driverGroups[0].driverMcNo}`;
      setSelectedDriver(firstDriverKey);
    }
  }, [driverGroups, selectedDriver]);

  // Get selected driver's emails
  const selectedDriverData = useMemo(() => {
    if (!selectedDriver) return null;
    return driverGroups.find(g => `${g.driverId}-${g.driverMcNo}` === selectedDriver) || null;
  }, [selectedDriver, driverGroups]);

  // Early return AFTER all hooks are called
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <EnvelopeIcon className="h-8 w-8 text-emerald-600" />
                Sent Emails
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                View all sent emails and replies. {sentCount} sent, {repliesCount} with replies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCheckEnabled}
                  onChange={(e) => setAutoCheckEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span>Auto-check (1 min)</span>
              </label>
              <button
                onClick={() => handleCheckReplies(false)}
                disabled={checkingReplies}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {checkingReplies ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Check Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All ({emails.length})
            </button>
            <button
              onClick={() => setFilter('with-replies')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'with-replies'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              With Replies ({repliesCount})
            </button>
            <button
              onClick={() => setFilter('no-replies')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'no-replies'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              No Replies ({emails.length - repliesCount})
            </button>
          </div>
        </div>

        {/* Split View: Drivers List + Emails */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-16rem)]">
          {/* Left Sidebar - Drivers List */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">Drivers ({driverGroups.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {driverGroups.length === 0 ? (
                <div className="p-8 text-center">
                  <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No drivers found</p>
                </div>
              ) : (
                driverGroups.map((group) => {
                  const driverKey = `${group.driverId}-${group.driverMcNo}`;
                  const isSelected = selectedDriver === driverKey;
                  const groupRepliesCount = group.emails.filter(e => e.replyReceived).length;
                  const hasUnseenReply = group.emails.some(e => 
                    e.replyReceived && 
                    e.replyAt && 
                    new Date(e.replyAt) > new Date(Date.now() - 10 * 60 * 1000) &&
                    !expandedEmails.has(e.id)
                  );

                  return (
                    <div
                      key={driverKey}
                      className={`p-4 border-b border-gray-100 transition-colors ${
                        isSelected 
                          ? 'bg-emerald-50 border-l-4 border-l-emerald-600' 
                          : 'hover:bg-gray-50'
                      } ${hasUnseenReply ? 'ring-1 ring-emerald-400 ring-opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          onClick={() => setSelectedDriver(driverKey)}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-emerald-900' : 'text-gray-900'
                            }`}>
                              {group.driverName}
                            </h3>
                            {hasUnseenReply && (
                              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <IdentificationIcon className="h-3 w-3" />
                            <span className="font-mono">MC: {group.driverMcNo}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{group.emails.length} mail{group.emails.length !== 1 ? 's' : ''}</span>
                            {groupRepliesCount > 0 && (
                              <span className="text-emerald-600">{groupRepliesCount} repl{groupRepliesCount !== 1 ? 'ies' : 'y'}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isSelected && (
                            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmDriver({
                                driverId: group.driverId,
                                driverName: group.driverName,
                                driverMcNo: group.driverMcNo,
                              });
                            }}
                            disabled={deletingDriver === group.driverId}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete all emails for this driver"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side - Selected Driver's Emails */}
          <div className="col-span-9 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {!selectedDriverData ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No driver selected
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select a driver from the left to view their emails
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Driver Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedDriverData.driverName}</h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <IdentificationIcon className="h-4 w-4" />
                          <span className="font-mono">MC: {selectedDriverData.driverMcNo}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{selectedDriverData.toEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{selectedDriverData.emails.length} email{selectedDriverData.emails.length !== 1 ? 's' : ''}</span>
                        </div>
                        {selectedDriverData.emails.filter(e => e.replyReceived).length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-600">
                              {selectedDriverData.emails.filter(e => e.replyReceived).length} repl{selectedDriverData.emails.filter(e => e.replyReceived).length !== 1 ? 'ies' : 'y'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emails List */}
                <div className="flex-1 overflow-y-auto">
                  {selectedDriverData.emails.length === 0 ? (
                    <div className="p-12 text-center">
                      <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No emails found
                      </h3>
                      <p className="text-sm text-gray-500">
                        No emails for this driver
                      </p>
                    </div>
                  ) : (
                    selectedDriverData.emails.map((email) => {
                      const isExpanded = expandedEmails.has(email.id);
                      const hasUnseenReply = !isExpanded && email.replyReceived && 
                        email.replyAt && 
                        new Date(email.replyAt) > new Date(Date.now() - 10 * 60 * 1000);

                      return (
                        <div
                          key={email.id}
                          className={`p-4 border-b border-gray-100 ${
                            email.replyReceived ? 'bg-emerald-50/30' : ''
                          } ${hasUnseenReply ? 'ring-2 ring-emerald-400 ring-opacity-50' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                {email.status === 'sent' ? (
                                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedEmails);
                                        if (isExpanded) {
                                          newExpanded.delete(email.id);
                                        } else {
                                          newExpanded.add(email.id);
                                          if (hasUnseenReply) {
                                            setUnseenRepliesCount(prev => Math.max(0, prev - 1));
                                          }
                                        }
                                        setExpandedEmails(newExpanded);
                                      }}
                                      className="text-sm font-semibold text-gray-900 truncate hover:text-emerald-600 transition-colors cursor-pointer text-left flex items-center gap-2"
                                    >
                                      {email.subject}
                                      {hasUnseenReply && (
                                        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></span>
                                      )}
                                      {isExpanded ? (
                                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                      ) : (
                                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      )}
                                    </button>
                                    {email.replyReceived && (
                                      <span className="px-2 py-0.5 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full">
                                        Reply Received
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                    <div className="flex items-center gap-1.5">
                                      <ClockIcon className="h-3.5 w-3.5" />
                                      <span>{new Date(email.sentAt).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="ml-8 mt-4 space-y-4 border-t border-gray-200 pt-4">
                                  {/* Show if this is a reply to another email */}
                                  {email.parentEmailId && (
                                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                      <span className="font-semibold">↩ Replying to:</span> This is a reply to a previous message
                                    </div>
                                  )}

                                  {/* Original Email Content */}
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-700">From:</span>
                                        <span className="text-xs text-gray-900">SkyWhole Logistics</span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(email.sentAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-xs font-semibold text-gray-700">To:</span>
                                      <span className="text-xs text-gray-900 ml-2">{email.toEmail}</span>
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-xs font-semibold text-gray-700">Subject:</span>
                                      <span className="text-xs text-gray-900 ml-2">{email.subject}</span>
                                    </div>
                                    {email.status === 'failed' && email.errorMessage && (
                                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                        Error: {email.errorMessage}
                                      </div>
                                    )}
                                  </div>

                                  {/* Reply Content */}
                                  {email.replyReceived && email.replyContent && (
                                    <div className="p-4 bg-white border-l-4 border-emerald-500 rounded-lg shadow-sm">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-semibold text-gray-700">From:</span>
                                          <span className="text-xs text-gray-900">{email.toEmail}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          Reply received {email.replyAt ? new Date(email.replyAt).toLocaleString() : ''}
                                        </span>
                                      </div>
                                      <div className="mb-2">
                                        <span className="text-xs font-semibold text-gray-700">To:</span>
                                        <span className="text-xs text-gray-900 ml-2">SkyWhole Logistics</span>
                                      </div>
                                      <div className="mb-2">
                                        <span className="text-xs font-semibold text-gray-700">Subject:</span>
                                        <span className="text-xs text-gray-900 ml-2">Re: {email.subject}</span>
                                      </div>
                                      <p className="text-sm text-gray-900 whitespace-pre-wrap mt-3">
                                        {email.replyContent}
                                      </p>
                                      <div className="mt-4 text-right">
                                        <button
                                          onClick={() => handleReply(email)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                        >
                                          <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {replyingTo.toEmail}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  Re: {replyingTo.subject}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Reply *
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                  <span>Send Reply</span>
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyMessage('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDriver && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrashIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Email Data</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to delete all email data for:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="font-semibold text-gray-900">{deleteConfirmDriver.driverName}</p>
                <p className="text-xs text-gray-600 font-mono">MC: {deleteConfirmDriver.driverMcNo}</p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                All emails and replies for this driver will be permanently deleted from the database. 
                Your emails will still be available in your mail server.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDeleteDriverEmails(
                  deleteConfirmDriver.driverId,
                  deleteConfirmDriver.driverName,
                  deleteConfirmDriver.driverMcNo
                )}
                disabled={deletingDriver === deleteConfirmDriver.driverId}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {deletingDriver === deleteConfirmDriver.driverId ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setDeleteConfirmDriver(null)}
                disabled={deletingDriver === deleteConfirmDriver.driverId}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className={`${
            toastMessage.includes('Error') || toastMessage.includes('Failed')
              ? 'bg-red-600' 
              : toastMessage.includes('No new')
              ? 'bg-blue-600'
              : 'bg-emerald-600'
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
            {toastMessage.includes('Error') || toastMessage.includes('Failed') ? (
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

