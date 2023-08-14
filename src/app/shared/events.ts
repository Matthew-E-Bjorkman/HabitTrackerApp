export enum AppEventType {
    HabitListUpdated = 'HABIT_LIST_UPDATED',
    HabitStreakListUpdated = 'HABIT_STREAK_LIST_UPDATED',
    HabitReminderListUpdated = 'HABIT_REMINDER_LIST_UPDATED'
}
export class AppEvent<T> {
    constructor(
      public type: AppEventType,
      public payload: T,
    ) {}
  }