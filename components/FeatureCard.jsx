'use client';

import { Shield, Activity, BarChart3, Lock } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const FEATURES = [
  {
    title: 'Transparent process',
    icon: <Shield size={24} strokeWidth={2} />,
    iconColor: 'text-cyan-400',
    body: 'Every grievance is logged with a timestamp and a unique reference number. Nothing disappears, nothing is buried.',
  },
  {
    title: 'Staff accountability',
    icon: <Activity size={24} strokeWidth={2} />,
    iconColor: 'text-indigo-400',
    body: 'Authorized staff own each case from assignment to resolution, with role-based access and a tamper-evident audit trail.',
  },
  {
    title: 'Real-time tracking',
    icon: <BarChart3 size={24} strokeWidth={2} />,
    iconColor: 'text-emerald-400',
    body: 'Students can check the status of their complaint at any time — submitted, under review, in progress, or resolved.',
  },
  {
    title: 'Secure access',
    icon: <Lock size={24} strokeWidth={2} />,
    iconColor: 'text-rose-400',
    body: 'College-domain email verification and encrypted sessions keep student data and grievance details protected.',
  },
];

export default function FeatureCard({ feature, index, delay = 0 }) {
  const { ref, inView } = useInView({ once: true, threshold: 0.15 });
  const visible = inView || feature._force;

  return (
    <div ref={ref} className={`group relative rounded-2xl p-8 md:p-10 border border-white/10 bg-white/5 transition-all duration-300 hover:border-cyan-500/50 hover:bg-white/10 hover:-translate-y-1 ${visible ? 'animate-fade-in' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards', animationDuration: '0.8s', animationTimingFunction: 'ease-out' }}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.iconColor} bg-white/5 border border-white/10`}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm md:text-base">{feature.body}</p>
    </div>
  );
}

export function FeatureGrid({ className = '' }) {
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {FEATURES.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} delay={index * 0.12} />
      ))}
    </div>
  );
}