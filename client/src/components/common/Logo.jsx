import { GraduationCap } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <GraduationCap size={30} className="text-white shrink-0" />
      <span className="font-semibold text-white text-base sm:text-lg whitespace-nowrap">College Event Management</span>
    </div>
  );
}
