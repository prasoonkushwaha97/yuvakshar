import React from 'react';
import { cn } from '@/lib/utils';
import { Role } from '@/lib/rbacService';

interface RoleBadgeProps {
  role: Role | { slug: string; name: string };
  className?: string;
}

const getRoleColorClass = (slug: string) => {
  switch (slug) {
    case 'founder':
      return 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20'; // Gold
    case 'admin':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20'; // Orange
    case 'editor':
      return 'bg-green-500/10 text-green-500 border-green-500/20'; // Green
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  if (!role || !role.name) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        getRoleColorClass(role.slug),
        className
      )}
      title={role.name}
    >
      {role.name}
    </span>
  );
};

const ROLE_HIERARCHY_RANK: Record<string, number> = {
  'founder': 0,
  'admin': 1,
  'editor': 2,
};

export function RoleBadgeList({ roles, className }: { roles: (Role | { slug: string; name: string })[], className?: string }) {
  if (!roles || roles.length === 0) return null;
  
  // Sort roles by hierarchy (lowest number first) to find the highest authority role
  const sortedRoles = [...roles].sort((a, b) => {
    const rankA = ROLE_HIERARCHY_RANK[a.slug] ?? 999;
    const rankB = ROLE_HIERARCHY_RANK[b.slug] ?? 999;
    return rankA - rankB;
  });

  // Display only the highest authority badge
  const highestRole = sortedRoles[0];
  
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <RoleBadge role={highestRole} />
      {sortedRoles.length > 1 && (
        <span className="text-[10px] text-slate-400 self-center ml-1" title={sortedRoles.slice(1)?.map(r => r.name).join(', ')}>
          +{sortedRoles.length - 1}
        </span>
      )}
    </div>
  );
}
