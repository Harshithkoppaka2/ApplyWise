export type Status = 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
export type Application = { id: number; company: string; role: string; location: string; status: Status; appliedOn: string; resumeVersion: string; jobUrl: string; jobDescription: string; notes: string };
export type ApplicationInput = Omit<Application, 'id'>;
export type Summary = { total: number; responses: number; interviews: number; offers: number; rejected: number; responseRate: number };
export type Breakdown = { name: string; applied: number; responses: number; responseRate: number };
export type Answer = { answer: string; source: 'ai' | 'local'; toolUsed: string };
