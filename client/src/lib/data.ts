export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  avatar?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  value: number;
  lastContact: string;
  nextFollowup?: string; // Added next followup
  followupNote?: string; // Added followup note
  ownerId: string;
}

export const mockAgents: Agent[] = [
  { id: 'A1', name: 'Alex Morgan', email: 'alex@leea.com', role: 'admin' },
  { id: 'A2', name: 'Jamie Lee', email: 'jamie@leea.com', role: 'agent' },
  { id: 'A3', name: 'Sam Rivera', email: 'sam@leea.com', role: 'agent' },
];

export const mockLeads: Lead[] = [
  {
    id: 'L-1001',
    name: 'Sarah Chen',
    company: 'TechFlow Dynamics',
    email: 'sarah.c@techflow.com',
    status: 'qualified',
    value: 1250000,
    lastContact: '2023-11-15',
    nextFollowup: '2023-12-20',
    followupNote: 'Discuss Q1 requirements',
    ownerId: 'A1'
  },
  {
    id: 'L-1002',
    name: 'Michael Ross',
    company: 'Apex Manufacturing',
    email: 'mross@apex.co',
    status: 'negotiation',
    value: 4500000,
    lastContact: '2023-11-14',
    nextFollowup: '2023-12-22',
    followupNote: 'Final price negotiation',
    ownerId: 'A2'
  },
  {
    id: 'L-1003',
    name: 'Jessica Wu',
    company: 'Global Logistics',
    email: 'j.wu@glogistics.net',
    status: 'new',
    value: 820000,
    lastContact: '2023-11-16',
    nextFollowup: '2023-12-18',
    followupNote: 'Introduction call',
    ownerId: 'A1'
  },
  {
    id: 'L-1004',
    name: 'David Miller',
    company: 'Miller & Sons',
    email: 'david@millersons.com',
    status: 'contacted',
    value: 1500000,
    lastContact: '2023-11-12',
    nextFollowup: '2023-12-25',
    followupNote: 'Follow up on technical specs',
    ownerId: 'A3'
  },
  {
    id: 'L-1005',
    name: 'Emily Davis',
    company: 'BrightStar Energy',
    email: 'edavis@brightstar.io',
    status: 'proposal',
    value: 2800000,
    lastContact: '2023-11-15',
    nextFollowup: '2023-12-21',
    followupNote: 'Present solution deck',
    ownerId: 'A2'
  }
];

export const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  contacted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  proposal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  negotiation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  closed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};
