import { useState } from 'react';
import { DUMMY_CREATORS } from '../../data/creators';
import { AvailabilityCalendar } from '../../components/AvailabilityCalendar';
import { buildDefaultAvailability } from '../../data/creatorDefaults';
import type { CreatorAvailabilityData } from '../../types';
import { Calendar, Clock } from 'lucide-react';

export default function CreatorAvailabilityPage() {
  const creator = DUMMY_CREATORS[0];
  const [calendar, setCalendar] = useState<CreatorAvailabilityData>(
    creator.availabilityCalendar || buildDefaultAvailability()
  );
  const [selectedDate, setSelectedDate] = useState('');

  const toggleUnavailable = () => {
    if (!selectedDate) return;
    setCalendar((prev) => {
      const booked = prev.bookedDates.filter((d) => d !== selectedDate);
      const unavailable = prev.unavailableDates.includes(selectedDate)
        ? prev.unavailableDates.filter((d) => d !== selectedDate)
        : [...prev.unavailableDates, selectedDate];
      return { ...prev, bookedDates: booked, unavailableDates: unavailable };
    });
  };

  const markBooked = () => {
    if (!selectedDate) return;
    setCalendar((prev) => ({
      ...prev,
      bookedDates: prev.bookedDates.includes(selectedDate)
        ? prev.bookedDates
        : [...prev.bookedDates, selectedDate],
      unavailableDates: prev.unavailableDates.filter((d) => d !== selectedDate),
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" /> Availability
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Your Calendar</h3>
          <AvailabilityCalendar
            availability={calendar}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            interactive
          />
          {selectedDate && (
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={markBooked} className="btn-secondary flex-1 text-sm">Mark Booked</button>
              <button type="button" onClick={toggleUnavailable} className="btn-secondary flex-1 text-sm">Mark Unavailable</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Upcoming Bookings
            </h3>
            <p className="text-sm text-surface-500">{calendar.bookedDates.length} dates booked</p>
            <ul className="mt-2 space-y-1 text-sm">
              {calendar.bookedDates.slice(0, 5).map((d) => (
                <li key={d} className="text-red-600">🔴 {d}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Availability Settings</h3>
            <p className="text-sm text-surface-500">
              Confirmed projects automatically appear as booked. Mark vacation days as unavailable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
