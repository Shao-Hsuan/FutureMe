import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '../../utils/date';

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export default function DatePicker({ date, onChange }: DatePickerProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDateClick = () => {
    setIsEditing(true);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onChange(newDate);
    setIsEditing(false);
  };

  return (
    <div className="relative flex items-center gap-2 cursor-pointer" onClick={handleDateClick}>
      <Calendar className="w-5 h-5 text-gray-500" />
      {isEditing ? (
        <input
          type="date"
          value={date.toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          autoFocus
        />
      ) : null}
      <span className="text-lg font-semibold">{formatDate(date)}</span>
    </div>
  );
}