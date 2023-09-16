import * as DataEnums from "./data-enums";

/* Habit */
export class Habit {
    "HabitSID": string;
    "Name": string;
    "Icon": string;
    "Type": DataEnums.HabitType;
    "FrequencyCategory": DataEnums.HabitFrequencyCategory;
    "FrequencyCategoryValues": string[];
    "IsArchived": boolean;
    "Reminders": HabitReminder[];
}

/* Habit_Streak */
export class HabitStreak {
    "HabitStreakSID": string;
    "HabitSID": string;
    "StartDate": Date;
    "EndDate": Date;
    "StreakCount": number;
}

/* Habit_Reminder */
export class HabitReminder {
    "HabitReminderSID": string;
    "HabitSID": string;
    "ReminderTime": string;
    "NotificationSID": number;
}