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
    const [addNewReminder, setAddNewReminder] = useState(false);
    const [reminderText, setReminderText] = useState("");
    let [eventTitle, setEventTitle] = useState("");
    const [error, setError] = useState("");
    const [reminders, setReminders] = useState(() => {
        // Retrieve stored reminders from local storage on initial render
        const storedReminders = localStorage.getItem('reminders');
        return storedReminders ? JSON.parse(storedReminders) : {};
    });
    const [showMonthsDropdown, setShowMonthsDropdown] = useState(false);
    const [datePickerHeight, setDatePickerHeight] = useState(0);
    const [eventTitleHeight, setEventTitleHeight] = useState(0);
    const [notify, setNotify] = useState(0);
    const dropdownRef = useRef(null); // Ref for the dropdown
    const reminderRef = useRef(null);
    const datePickerRef = useRef(null);
    const eventTitleRef = useRef(null);

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
            if (eventTitle.trim() === "") {
                eventTitle = "No Title";
            }
            setError("");

            // Get the current reminders for the selected date
            const dateKey = `${selectedYear}-${selectedMonth}-${selectedDate}`;
            const existingReminders = reminders[dateKey] || [];

            // Create a new reminder object
            const newReminder = { reminderText, eventTitle };

            // Update the reminders array for the selected date
            const newReminders = {
                ...reminders,
                [dateKey]: [...(Array.isArray(existingReminders) ? existingReminders : []), newReminder],
            };

            setReminders(newReminders);
            localStorage.setItem('reminders', JSON.stringify(newReminders)); // Store reminders in local storage

            resetForm(); // Reset the form after successful submission
        }
    };

    const resetForm = () => {
        setReminderText("");
        setEventTitle("");
        setShowReminderArea(false);
        setError("");
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent page reload
        addReminder(); // Call addReminder to handle validation and submission
    };

    const getDayOfWeek = (year, month, day) => {
        const date = new Date(year, month, day);
        const weekDays = [
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ];
        return weekDays[date.getDay()];
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

    // TO get th eheight of the DatePicker
    useEffect(() => {
        const updateDatePickerHeight = () => {
            if (datePickerRef.current) {
                setDatePickerHeight(datePickerRef.current.scrollHeight)
            }
            if (eventTitleRef.current) {
                setEventTitleHeight(eventTitleRef.current.offsetWidth);
            }
        };
        if (setShowReminderArea) {
            updateDatePickerHeight();
        }
        window.addEventListener('resize', updateDatePickerHeight);
        return () => {
            window.removeEventListener('resize', updateDatePickerHeight);
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
    console.log(reminders);

    useEffect(() => {
        const reminderKey = `${selectedYear}-${selectedMonth}-${selectedDate}`;
        const reminder = reminders[reminderKey] || [];
        setNotify(reminder.length);
    }, [selectedYear, selectedMonth, selectedDate, reminders]);

    const getReminders = () => {
        const reminderKey = `${selectedYear}-${selectedMonth}-${selectedDate}`;
        const reminder = reminders[reminderKey];

        if (reminder && reminder.length > 0) {
            if (notify > 0) {
                return (
                    <div className="d_flex">
                        <div className={`w_100 ${notify}`}>
                            {reminder.map((reminder, index) => (
                                <div key={index}>
                                    <div className="d_flex pb_10">
                                        <div className="event_title col_20">
                                            <div ref={eventTitleRef}>Event Title </div><span>:</span>
                                        </div>
                                        <div className="col_80 max_width_500">{reminder.eventTitle}</div>
                                    </div>
                                    <div className="d_flex">
                                        <div className="event_msg col_20"><div style={{ width: eventTitleHeight + 'px' }}>Message </div><span>:</span></div>
                                        <div className="col_80 max_width_500">{reminder.reminderText}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
        }
    };
    return (
        <div className="date_picker_wrap">
            <div className="date_picker" ref={datePickerRef}>
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
                                    <span className="hasReminder"></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <form id="reminder_form" className="reminder_form" onSubmit={handleSubmit}>
                <div className={`${showReminderArea ? 'show' : 'hide'} reminder_text`} ref={reminderRef}>
                    <div className="reminder_popup" style={{ maxHeight: datePickerHeight + 'px' }}>
                        <span className="reminder_close" onClick={() => {
                            resetForm();
                            setAddNewReminder(false);
                        }}></span>
                        <div className="reminder_wrap" style={{ maxHeight: datePickerHeight + 'px' }}>
                            <div className="reminder_body">
                                <div className="reminder_dates pb_15">
                                    <div className="text_l">
                                        <span className="f_14">{selectedDate}<span className="pl_5 f_14">{months[selectedMonth]}</span></span>
                                        <span className="d_block f_20">{`${getDayOfWeek(selectedYear, selectedMonth, selectedDate)}`}</span>
                                    </div>
                                    <div className="d_flex">
                                        <span className="reminder_year">{selectedYear}</span>
                                    </div>
                                </div>
                                <div className={`${addNewReminder ? 'yes' : ''} existing_reminders`}>
                                    {getReminders()}
                                </div>
                                <div>
                                    <div className="d_flex pb_10 align_start">
                                        <div className="event_title col_20"><div ref={eventTitleRef}>Event Title </div><span>:</span></div>
                                        <div className="col_80">
                                            <input
                                                value={eventTitle}
                                                onChange={(e) => {
                                                    setEventTitle(e.target.value)
                                                }}
                                                type="text"
                                                placeholder="Event Name"
                                                name="event_name"
                                                id="event_name"
                                                className="event_name"
                                            />
                                        </div>
                                    </div>
                                    <div className="d_flex align_start">
                                        <div className="event_msg col_20"><div style={{ width: eventTitleHeight + 'px' }}>Message </div><span>:</span></div>
                                        <textarea
                                            className="col_80"
                                            id="reminder"
                                            name="reminder"
                                            rows="4"
                                            cols="50"
                                            placeholder="Type Your Reminders Here . . . ."
                                            value={reminderText}
                                            onChange={(e) => setReminderText(e.target.value)}
                                        />
                                    </div>
                                    {selectedDate && showReminderArea && error && (
                                        <div className="error text_c">
                                            {error && (
                                                <div className="error">{error}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="add_reminder d_flex gap_15 reminder_footer">
                                {notify > 0 && (
                                    <input type="button" className="btn" value="Your Reminders" />
                                )}
                                <input
                                    type="submit"
                                    className="btn"
                                    value="Add Reminder"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="add_reminder">
                    <button onClick={() => {
                        setShowReminderArea(true);
                        setError("");
                    }}
                        className={`btn ${showReminderArea ? 'clicked' : ''}`}
                        disabled={showReminderArea}
                    >
                        Set Reminder
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DatePicker;
