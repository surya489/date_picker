import React, { useState, useEffect, useRef } from "react";
import './DatePicker.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Function to remove reminders of the Past Dates
const removeExpiredReminders = (reminders, today) => {
    const updatedReminders = { ...reminders };

    Object.keys(updatedReminders).forEach((key) => {
        const [year, month, day] = key.split('-').map(Number);
        const reminderDate = new Date(year, month, day);

        if (reminderDate < today) {
            delete updatedReminders[key]; // Remove expired reminder
        }
    });

    return updatedReminders;
};

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
    const dropdownRef = useRef(null); // Ref for the dropdown

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

    useEffect(() => {
        const today = new Date();
        const updatedReminders = removeExpiredReminders(reminders, today);
        setReminders(updatedReminders);
        localStorage.setItem('reminders', JSON.stringify(updatedReminders)); // Update local storage
    }, [reminders, currentMonth, currentYear]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMonthsDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                    <div className="month_wrap" ref={dropdownRef}>
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
                    <>
                        <h3>Add Reminder for {selectedDate}/{currentMonth + 1}/{currentYear}</h3>
                        <div>
                            <input
                                type="text"
                                value={reminderText}
                                onChange={(e) => setReminderText(e.target.value)}
                                placeholder="Reminder text"
                            />
                        </div>
                        <div>
                            <button type="submit">Set Reminder</button>
                            <button type="button" onClick={resetForm}>Cancel</button>
                        </div>
                    </>
                )}
                {error && <p className="error_message">{error}</p>}
            </form>
        </div>
    );
};

export default DatePicker;
