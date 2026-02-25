import { Box, CheckCircle2, FileText, Glasses, Layers, type LucideIcon } from 'lucide-react';

export type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#docs', label: 'Documentation' },
] as const;

export const FEATURE_CARDS: FeatureCard[] = [
  { icon: Layers, title: '2D Plan Set', description: 'Auto-generated scaled floor plans and elevations.' },
  { icon: Box, title: '3D Modeling', description: 'Instant glTF models ready for export or rendering.' },
  { icon: Glasses, title: 'VR Walkthrough', description: '360° panoramas and WebXR immersive experiences.' },
  { icon: FileText, title: 'BOQ Estimates', description: 'Accurate bill of quantities for budget planning.' },
];

export const WORKFLOW_STEPS = [
  'Intake requirements via natural language',
  'Upload existing blueprints for AI parsing',
  'Generate 3 distinct concept options',
  'Iterate and refine with conversational AI',
  'Export high-fidelity assets and documentation',
] as const;

export const PIPELINE_STAGES = [
  { name: 'Spatial Reasoning', status: 'Completed', progressClass: 'w-full', tone: 'emerald' },
  { name: '3D Geometry Synthesis', status: 'Completed', progressClass: 'w-full', tone: 'emerald' },
  { name: 'Photorealistic Rendering', status: 'Processing', progressClass: 'animated', tone: 'amber' },
] as const;

export const WORKFLOW_ICON = CheckCircle2;
