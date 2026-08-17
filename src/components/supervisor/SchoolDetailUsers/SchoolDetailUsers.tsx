import { memo } from 'react';
import type { UserProfile } from '@/types';
import AccordionSection from '../AccordionSection/AccordionSection';

interface SchoolDetailUsersProps {
  users: UserProfile[];
  expandedSection: string;
  onToggle: () => void;
}

const SchoolDetailUsers = ({ users, expandedSection, onToggle }: SchoolDetailUsersProps) => (
  <AccordionSection
    title="Usuarios"
    count={`${users.length} usuarios`}
    isExpanded={expandedSection === 'usuarios'}
    onToggle={onToggle}
  >
    {users.length === 0 ? (
      <div className="supervisor-sub__empty">No hay usuarios asignados a esta escuela.</div>
    ) : (
      users.map((u) => (
        <div key={u.uid} className="supervisor-sub__record supervisor-detail__user">
          <div className="supervisor-sub__record-header">
            <span className="supervisor-sub__record-date">{u.nombre}</span>
            <span className="supervisor-detail__user-role">{u.rol}</span>
          </div>
          <div className="supervisor-detail__user-meta">
            <span>{u.email}</span>
            <span>{u.cargo}</span>
          </div>
        </div>
      ))
    )}
  </AccordionSection>
);

export default memo(SchoolDetailUsers);
