import * as DataEnums from "./data-enums";

/* Habit */
export class Habit {
    "HabitSID": string;
    "Name": string;
    "Icon": string;
    "Type": DataEnums.HabitType;
    "FrequencyCategory": DataEnums.HabitFrequencyCategory;
    "FrequencyCategoryValues": number[];
    "IsArchived": boolean;
}

/* Habit_Streak */
export class HabitStreak {
    "HabitStreakSID": string;
    "HabitSID": number;
    "StartDate": Date;
    "EndDate": Date;
    "StreakCount": number;
    "IsActive": boolean;
}

/* Habit_Reminder */
export class HabitReminder {
    "HabitReminderSID": string;
    "HabitSID": number;
    "ReminderTime": Date;
}