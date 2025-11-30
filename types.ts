export enum NavigationTab {
  Dashboard = 'Dashboard',
  AIWorkbench = 'AI Workbench',
  Generator = 'Contract Generator',
  Scanner = 'Camera Scanner',
  Map = 'Global Map',
  UserGuide = 'User Guide',
  Profile = 'My Profile',
}

export interface Contract {
  id: string;
  title: string;
  parties: string[];
  status: 'active' | 'expired' | 'pending' | 'archived';
  deadline: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  location: {
    name: string;
    coordinates: [number, number];
  };
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  gender?: string;
  age?: string;
  address?: string;
}