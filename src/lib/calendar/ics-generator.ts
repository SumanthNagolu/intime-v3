/**
 * ICS Calendar File Generator
 * Generates RFC 5545 compliant iCalendar (.ics) files for interview invitations
 */

export interface ICSAttendee {
  name: string;
  email: string;
  role?: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'CHAIR';
  rsvp?: boolean;
}

export interface ICSOptions {
  title: string;
  description: string;
  startTime: Date;
  durationMinutes: number;
  location?: string;
  organizer: { name: string; email: string };
  attendees: ICSAttendee[];
  uid?: string;
  sequence?: number;
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  url?: string;
  reminder?: number; // minutes before event
}

/**
 * Formats a Date to ICS datetime format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates a unique identifier for calendar events
 */
function generateUID(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}@intime.app`;
}

/**
 * Escapes special characters in ICS text fields
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Folds long lines according to RFC 5545 (max 75 chars per line)
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const lines: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    lines.push(remaining.substring(0, maxLength));
    remaining = ' ' + remaining.substring(maxLength);
  }
  lines.push(remaining);

  return lines.join('\r\n');
}

/**
 * Generates an ICS calendar file content for an interview
 */
export function generateICS(options: ICSOptions): string {
  const {
    title,
    description,
    startTime,
    durationMinutes,
    location,
    organizer,
    attendees,
    uid = generateUID(),
    sequence = 0,
    status = 'CONFIRMED',
    url,
    reminder = 15,
  } = options;

  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InTime//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startTime)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    `STATUS:${status}`,
    `SEQUENCE:${sequence}`,
    `ORGANIZER;CN=${escapeICSText(organizer.name)}:mailto:${organizer.email}`,
  ];

  // Add attendees
  for (const attendee of attendees) {
    const role = attendee.role || 'REQ-PARTICIPANT';
    const rsvp = attendee.rsvp !== false ? 'TRUE' : 'FALSE';
    lines.push(
      `ATTENDEE;ROLE=${role};RSVP=${rsvp};CN=${escapeICSText(attendee.name)}:mailto:${attendee.email}`
    );
  }

  // Add optional fields
  if (location) {
    lines.push(`LOCATION:${escapeICSText(location)}`);
  }

  if (url) {
    lines.push(`URL:${url}`);
  }

  // Add reminder alarm
  if (reminder > 0) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Interview reminder: ${escapeICSText(title)}`,
      `TRIGGER:-PT${reminder}M`,
      'END:VALARM'
    );
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  // Fold lines and join with CRLF
  return lines.map(foldLine).join('\r\n');
}

/**
 * Generates ICS for a cancelled event
 */
export function generateCancellationICS(options: Omit<ICSOptions, 'status'>): string {
  return generateICS({
    ...options,
    status: 'CANCELLED',
    sequence: (options.sequence || 0) + 1,
  });
}

/**
 * Generates ICS for a rescheduled event
 */
export function generateRescheduleICS(
  options: ICSOptions,
  newStartTime: Date
): string {
  return generateICS({
    ...options,
    startTime: newStartTime,
    sequence: (options.sequence || 0) + 1,
    description: `RESCHEDULED: ${options.description}`,
  });
}

/**
 * Generates ICS filename for an interview
 */
export function generateICSFilename(
  candidateName: string,
  companyName: string,
  roundNumber: number
): string {
  const sanitize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return `interview-${sanitize(candidateName)}-${sanitize(companyName)}-round${roundNumber}.ics`;
}

/**
 * Creates interview ICS with standard formatting
 */
export function createInterviewICS(options: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  roundNumber: number;
  interviewType: string;
  scheduledAt: Date;
  durationMinutes: number;
  timezone: string;
  meetingLink?: string;
  meetingLocation?: string;
  interviewers: Array<{ name: string; email: string; title?: string }>;
  recruiterName: string;
  recruiterEmail: string;
  candidateEmail: string;
  notes?: string;
  uid?: string;
  sequence?: number;
}): { content: string; filename: string; uid: string } {
  const {
    candidateName,
    jobTitle,
    companyName,
    roundNumber,
    interviewType,
    scheduledAt,
    durationMinutes,
    meetingLink,
    meetingLocation,
    interviewers,
    recruiterName,
    recruiterEmail,
    candidateEmail,
    notes,
    uid = generateUID(),
    sequence = 0,
  } = options;

  const typeLabel = interviewType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const title = `Interview: ${candidateName} - ${jobTitle} (Round ${roundNumber})`;

  const descriptionParts = [
    `${typeLabel} Interview - Round ${roundNumber}`,
    `Candidate: ${candidateName}`,
    `Position: ${jobTitle}`,
    `Company: ${companyName}`,
    '',
    'Interviewers:',
    ...interviewers.map(i => `- ${i.name}${i.title ? ` (${i.title})` : ''}`),
  ];

  if (meetingLink) {
    descriptionParts.push('', `Meeting Link: ${meetingLink}`);
  }

  if (notes) {
    descriptionParts.push('', 'Notes:', notes);
  }

  descriptionParts.push(
    '',
    'Scheduled by InTime Recruiting',
    `Contact: ${recruiterName} (${recruiterEmail})`
  );

  const attendees: ICSAttendee[] = [
    { name: candidateName, email: candidateEmail, role: 'REQ-PARTICIPANT', rsvp: true },
    ...interviewers.map(i => ({
      name: i.name,
      email: i.email,
      role: 'REQ-PARTICIPANT' as const,
      rsvp: true,
    })),
  ];

  const content = generateICS({
    title,
    description: descriptionParts.join('\n'),
    startTime: scheduledAt,
    durationMinutes,
    location: meetingLocation || meetingLink,
    organizer: { name: recruiterName, email: recruiterEmail },
    attendees,
    uid,
    sequence,
    url: meetingLink,
    reminder: 15,
  });

  const filename = generateICSFilename(candidateName, companyName, roundNumber);

  return { content, filename, uid };
}
