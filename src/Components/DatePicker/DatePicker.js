import React, { useState, useEffect } from "react";
import './DatePicker.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const DatePicker = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [showReminderArea, setShowReminderArea] = useState(false);
    const [reminderText, setReminderText] = useState("");
    const [error, setError] = useState("");
    const [reminders, setReminders] = useState(() => {
        // Retrieve stored reminders from local storage on initial render
        const storedReminders = localStorage.getItem('reminders');
        return storedReminders ? JSON.parse(storedReminders) : {};
    });
    const [showMonthsDropdown, setShowMonthsDropdown] = useState(false);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "June",
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"
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
        setShowReminderArea(false); // Hide reminder area initially
    };

    const addReminder = () => {
        if (reminderText.trim() === "") {
            setError("Reminder text cannot be empty");
        } else {
            setError("");
            const newReminders = {
                ...reminders,
                [`${selectedYear}-${selectedMonth}-${selectedDate}`]: reminderText,
            };

            setReminders(newReminders);
            localStorage.setItem('reminders', JSON.stringify(newReminders)); // Store reminders in local storage

            resetForm(); // Reset the form after successful submission
        }
    };

    const resetForm = () => {
        setReminderText("");
        setShowReminderArea(false);
        setError("");
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent page reload
        addReminder(); // Call addReminder to handle validation and submission
    };

    // Function to print the date and reminder text separately
    const printReminders = () => {
        Object.entries(reminders).forEach(([date, text]) => {
            const [year, month, day] = date.split('-');
            return (
                <div>
                    <div>
                        {text}
                    </div>
                    <div>
                        ${day}-${parseInt(month) + 1}-${year}
                    </div>
                </div>
            )
        });
    };

    // Call the function to print the reminders
    printReminders();


    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const daysAfterLast = (7 - (daysInMonth + firstDay) % 7) % 7;

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
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

        const reminderKey = `${currentYear}-${currentMonth}-${day}`;
        const hasReminder = reminders[reminderKey];
        if (isToday) return `today ${isSelected ? 'selected' : ''} ${hasReminder ? 'set_reminder' : ''}`;
        if (isPast) return `past_date ${hasReminder ? 'set_reminder' : ''}`;
        if (isFuture) return `${isSelected ? 'selected' : ''} future_date ${hasReminder ? 'set_reminder' : ''}`;
    };

    const toggleDropdown = () => {
        setShowMonthsDropdown(!showMonthsDropdown);
    };

    const handleMonthClick = (index) => {
        setCurrentMonth(index);
        setShowMonthsDropdown(false); // Close the dropdown after selection
    };

    return (
        <div className="date_picker_wrap">
            <div className="date_picker">
                <div className="header">
                    <div className="month_wrap">
                        <span className="current_month">
                            <div className="selected_month" onClick={toggleDropdown}>
                                <span>{months[currentMonth]}</span>
                            </div>
                            {showMonthsDropdown && (
                                <div className="month_list_wrap">
                                    <ul className="month_list">
                                        {months.map((month, index) => (
                                            <li key={index} className={`${index === currentMonth ? 'active_month' : ''}`} onClick={() => handleMonthClick(index)}>
                                                {month}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </span>
                        <span className="slash">/</span>
                        <span>{currentYear}</span>
                    </div>
                    <div className="month_nav">
                        <button onClick={handlePrevMonth}><span><FontAwesomeIcon icon={faArrowLeft} /></span></button>
                        <button onClick={handleNextMonth}><span><FontAwesomeIcon icon={faArrowRight} /></span></button>
                    </div>
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
                                {day && reminders[`${currentYear}-${currentMonth}-${day}`] && (
                                    <div className="reminder_info">
                                        <div>{reminders[`${currentYear}-${currentMonth}-${day}`]}</div>
                                    </div>
                                )}
                                {day && reminders[`${currentYear}-${currentMonth}-${day}`]
                                    && (
                                        <span className="hasReminder"></span>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <form id="reminder_form" className="reminder_form" onSubmit={handleSubmit}>
                {selectedDate && showReminderArea && (
                    <div className={`${showReminderArea ? 'show' : 'hide'} reminder_text`}>
                        <textarea
                            id="reminder"
                            name="reminder"
                            rows="4"
                            cols="50"
                            placeholder="Type Your Reminders Here . . . ."
                            value={reminderText}
                            onChange={(e) => setReminderText(e.target.value)}
                        />
                        {error && <div className="error">{error}</div>}
                    </div>
                )}
                <div className="add_reminder">
                    {!showReminderArea ? (
                        <button onClick={() => setShowReminderArea(true)}
                            className={`btn ${showReminderArea ? 'clicked' : ''}`}
                            disabled={showReminderArea}
                        >
                            {showReminderArea ? "Add Reminder" : 'Set Reminder'}
                        </button>
                    ) : (
                        <input
                            type="submit"
                            className="btn clicked"
                            value="Add Reminder"
                        />
                    )}
                </div>
            </form>
        </div>
    );
}

export default DatePicker;
