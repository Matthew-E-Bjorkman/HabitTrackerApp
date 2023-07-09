import * as DataEnums from "./data-enums";

/* Habit */
export class Habit {
    "HabitSID": number;
    "Name": string;
    "Icon": DataEnums.HabitIcon;
    "Type": DataEnums.HabitType;
    "FrequencyCategory": DataEnums.HabitFrequencyCategory;
    "FrequencyCategoryValues": number[];
    "IsArchived": boolean;
}

/* Habit_Streak */
export class HabitStreak {
    "HabitStreakSID": number;
    "HabitSID": number;
    "StartDate": Date;
    "EndDate": Date;
    "StreakCount": number;
    "IsActive": boolean;
}

/* Habit_Reminder */
export class HabitReminder {
    "HabitReminderSID": number;
    "HabitSID": number;
    "ReminderTime": Date;
}