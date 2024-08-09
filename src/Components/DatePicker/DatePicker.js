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
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
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
    const reminderRef = useRef(null);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "June",
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const weeklyDays = [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ];

    const earliestYear = currentYear; // Define the earliest year to display
    const earliestMonth = today.getMonth();   // August (0 index)

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

    const getDayOfWeek = (year, month, day) => {
        const date = new Date(year, month, day);
        return weeklyDays[date.getDay()];
    };

    // Use a separate effect for reminder cleanup
    useEffect(() => {
        const today = new Date();
        const updatedReminders = removeExpiredReminders(reminders, today);

        if (Object.keys(updatedReminders).length !== Object.keys(reminders).length) {
            setReminders(updatedReminders);
            localStorage.setItem('reminders', JSON.stringify(updatedReminders)); // Update local storage
        }
    }, [reminders]); // Only depend on reminders

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMonthsDropdown(false);
            }
            // if (reminderRef.current && !reminderRef.current.contains(event.target)) {
            //     setShowReminderArea(false);
            // }
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

    const isPrevMonthDisabled = (currentYear === earliestYear && currentMonth === earliestMonth);

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
                    <div className="change_month">
                        <button className={`arrow_button ${isPrevMonthDisabled ? 'disabled' : ''}`} onClick={handlePrevMonth} disabled={isPrevMonthDisabled}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <button className="arrow_button" onClick={handleNextMonth}>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </div>
                <div className="calendar">
                    <div className="weekdays">
                        {weeklyDays.map((day) => (
                            <span key={day} className="weekday">{day}</span>
                        ))}
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
                                {day && reminders[`${currentYear}-${currentMonth}-${day}`] && (
                                    <span className="hasReminder"></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <form id="reminder_form" className="reminder_form" onSubmit={handleSubmit}>
                <div className={`${showReminderArea ? 'show' : 'hide'} reminder_text`} ref={reminderRef}>
                    <div className="reminder_head">
                        <span className="selected_date">
                            {`${getDayOfWeek(selectedYear, selectedMonth, selectedDate)}, ${selectedDate} ${months[selectedMonth]} ${selectedYear}`}
                        </span>
                        <span className="reminder_close" onClick={resetForm}>X</span>
                    </div>
                    <div>
                        <div className="reminder_date_wrap">
                            {selectedDate} {months[selectedMonth]} {selectedYear} {getDayOfWeek(selectedYear, selectedMonth, selectedDate)}
                        </div>
                        <input type="text" placeholder="Event Name" name="event_name" id="event_name" className="event_name" />
                        <textarea
                            id="reminder"
                            name="reminder"
                            rows="4"
                            cols="50"
                            placeholder="Type Your Reminders Here . . . ."
                            value={reminderText}
                            onChange={(e) => setReminderText(e.target.value)}
                        />
                        {selectedDate && showReminderArea && (
                            <div className="error">
                                {error && (
                                    <div className="error">{error}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="add_reminder">
                    {!showReminderArea ? (
                        <button onClick={() => {
                            setShowReminderArea(true);
                            setError("");
                        }}
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
};

export default DatePicker;
