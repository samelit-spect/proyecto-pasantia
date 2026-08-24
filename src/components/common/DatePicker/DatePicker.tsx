import { todayISO } from '@/utils/validation';
import './DatePicker.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  label?: string;
  min?: string;
  max?: string;
}

const DatePicker = ({
  value,
  onChange,
  disabled = false,
  label = 'Fecha',
  min,
  max,
}: DatePickerProps) => {
  return (
    <div className="date-picker">
      <label htmlFor="date-picker" className="date-picker__label">
        {label}
      </label>
      <input
        id="date-picker"
        type="date"
        className="date-picker__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max ?? todayISO()}
        required
      />
    </div>
  );
};

export default DatePicker;
