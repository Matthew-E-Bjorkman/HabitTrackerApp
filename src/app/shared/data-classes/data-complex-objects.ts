import * as DataObjects from "./data-objects";

export class HabitFull extends DataObjects.Habit {
    "Streaks": DataObjects.HabitStreak[];
    "Reminders": DataObjects.HabitReminder[];
}