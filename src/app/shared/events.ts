export enum AppEventType {
    HabitListUpdated = 'HABIT_LIST_UPDATED'
}
export class AppEvent<T> {
    constructor(
      public type: AppEventType,
      public payload: T,
    ) {}
  }