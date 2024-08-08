import React, { useState } from "react";
import './DatePicker.css';

const DatePicker = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [showReminderArea, setShowReminderArea] = useState(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateClick = (day) => {
        if (!day) return;
        setSelectedDate(day);
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
        if (!showReminderArea && !selectedDate) {
            setShowReminderArea(true);
        } else {
            setShowReminderArea(false);
        }
    };

    const addReminder = (message) => {
        if (!showReminderArea && selectedDate) {
            setShowReminderArea(true);
        }
    }

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

    // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    // Calculate the number of empty cells needed after the last day
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const daysAfterLast = (7 - (daysInMonth + firstDay) % 7) % 7;

    const days = [];
    // Add empty cells for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Add the actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    // Add empty cells for the days after the last day of the month
    for (let i = 0; i < daysAfterLast; i++) {
        days.push(null);
    }

    const getDayClass = (day) => {
        if (!day) return 'empty';

        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const isPast = (currentYear < today.getFullYear()) ||
            (currentYear === today.getFullYear() && currentMonth < today.getMonth()) ||
            (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate());

        const isSelected = day === selectedDate && currentMonth === selectedMonth && currentYear === selectedYear;
        const isFuture = !isToday && !isPast;

        if (isToday) return `today ${isSelected ? 'selected' : ''}`;
        if (isPast) return 'past_date';
        if (isFuture) return `${isSelected ? 'selected' : ''} future_date`;
    };

    return (
        <div className="date_picker_wrap">
            <div className="date_picker">
                <div className="header">
                    <button onClick={handlePrevMonth}>&lt;</button>
                    <span>{months[currentMonth]} {currentYear}</span>
                    <button onClick={handleNextMonth}>&gt;</button>
                </div>
                <div className="calendar">
                    <div className="day_names">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                    </div>
                    <div className="days">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`day ${getDayClass(day)}`}
                                onClick={() => handleDateClick(day)}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {selectedDate && (
                <div className={`${showReminderArea ? 'show' : 'hide'} reminder_text`}>
                    <textarea id="reminder" name="reminder" rows="4" cols="50" placeholder="Type Your Reminders Here . . . ." />
                </div>
            )}
            <div className="add_reminder">
                <input onClick={() => {
                    addReminder('clicked');
                }} type="submit"
                    className={`${showReminderArea ? 'clicked' : ''} btn`}
                    value={showReminderArea ? "Add Reminder" : 'Set Reminder'} />
            </div>
        </div >
    );
}

export default DatePicker;
