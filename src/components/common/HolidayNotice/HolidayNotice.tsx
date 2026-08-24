import { CalendarX } from 'lucide-react';
import { getHoliday } from '@/utils/holidays';
import './HolidayNotice.css';

interface HolidayNoticeProps {
  fecha: string;
}

const HolidayNotice = ({ fecha }: HolidayNoticeProps) => {
  const holiday = getHoliday(fecha);

  if (!holiday) return null;

  return (
    <div className="holiday-notice" role="note">
      <CalendarX size={15} strokeWidth={1.5} className="holiday-notice__icon" />
      <p className="holiday-notice__text">
        <strong>{holiday.name}</strong> (feriado nacional). Si tu escuela trabajó igual, cargá el
        registro con normalidad.
      </p>
    </div>
  );
};

export default HolidayNotice;
