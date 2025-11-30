
import { Contract } from '../types';

const d = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const mockContracts: Contract[] = [
  {
    id: 'c001',
    title: 'Project Alpha - Service Agreement',
    parties: ['Innovate Inc.', 'Solutions Corp.'],
    status: 'active',
    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    riskLevel: 'low',
    createdAt: d(45),
    location: { name: 'San Francisco, USA', coordinates: [-122.4194, 37.7749] },
  },
  {
    id: 'c002',
    title: 'Zeta Project - NDA',
    parties: ['TechGlobal', 'PrivacyFirst'],
    status: 'active',
    deadline: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString().split('T')[0],
    riskLevel: 'medium',
    createdAt: d(80),
    location: { name: 'London, UK', coordinates: [-0.1278, 51.5074] },
  },
  {
    id: 'c003',
    title: 'Omega Partnership',
    parties: ['Synergy Group', 'Future Vision Ltd.'],
    status: 'pending',
    deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
    riskLevel: 'high',
    createdAt: d(10),
    location: { name: 'Tokyo, Japan', coordinates: [139.6917, 35.6895] },
  },
  {
    id: 'c004',
    title: 'Software Licensing',
    parties: ['Code Wizards', 'AppMakers'],
    status: 'expired',
    deadline: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0],
    riskLevel: 'low',
    createdAt: d(120),
    location: { name: 'Berlin, Germany', coordinates: [13.4050, 52.5200] },
  },
  {
    id: 'c005',
    title: 'Marketing Campaign Agreement',
    parties: ['AdVantage', 'BrandBoosters'],
    status: 'active',
    deadline: new Date(new Date().setDate(new Date().getDate() + 180)).toISOString().split('T')[0],
    riskLevel: 'medium',
    createdAt: d(200),
    location: { name: 'Sydney, Australia', coordinates: [151.2093, -33.8688] },
  },
  {
    id: 'c006',
    title: 'Supply Chain Agreement - Mumbai',
    parties: ['Global Logistics', 'Bharat Retail'],
    status: 'active',
    deadline: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString().split('T')[0],
    riskLevel: 'medium',
    createdAt: d(30),
    location: { name: 'Mumbai, India', coordinates: [72.8777, 19.0760] },
  },
  {
    id: 'c007',
    title: 'IT Services Contract - Bangalore',
    parties: ['Tech Solutions Ltd.', 'Innovate India'],
    status: 'pending',
    deadline: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString().split('T')[0],
    riskLevel: 'low',
    createdAt: d(5),
    location: { name: 'Bangalore, India', coordinates: [77.5946, 12.9716] },
  }
];