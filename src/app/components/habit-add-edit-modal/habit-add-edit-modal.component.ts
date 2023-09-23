import { CommonModule } from '@angular/common';
import { Component, Input, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Habit, HabitReminder } from 'src/app/shared/data-classes/data-objects';
import { HabitFrequencyCategory, HabitType, HabitWeeklyFrequency, HabitMonthlyFrequency } from 'src/app/shared/data-classes/data-enums';
import { IconSelectModalComponent } from '../icon-select-modal/icon-select-modal.component';
import { HabitRepoService } from 'src/app/services/habit-repo/habit-repo.service';
import { Observable } from 'rxjs';
import { ValidationError } from 'src/app/shared/system-classes/system-objects';
import { HabitLogicService } from 'src/app/services/habit-logic/habit-logic.service';


@Component({
  selector: 'app-habit-add-edit-modal',
  templateUrl: './habit-add-edit-modal.component.html',
  styleUrls: ['./habit-add-edit-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, IconSelectModalComponent]
})
export class HabitAddEditModalComponent  implements OnInit {
  @Input() habit!: Habit;
  @Input() modal!: HTMLIonModalElement;

  private origHabit! : Habit;

  public habitTypeKeys = Object.values(HabitType);
  public habitTypes = HabitType;

  public habitFrequencyCategoryKeys = Object.values(HabitFrequencyCategory);
  public habitFrequencyCategories = HabitFrequencyCategory;

  public habitWeeklyFrequencyKeys = Object.values(HabitWeeklyFrequency);
  public habitWeeklyFrequencies = HabitWeeklyFrequency;

  public habitMonthlyFrequencyKeys = Object.values(HabitMonthlyFrequency);
  public habitMonthlyFrequencies = HabitMonthlyFrequency;

  public habitDailyOrNone!: Observable<boolean>;
  public habitWeekly!: Observable<boolean>;
  public habitMonthly!: Observable<boolean>;

  public currentReminder!: HabitReminder;

  public validationErrors!: ValidationError[];
  public validationFailed!: Observable<boolean>;

  constructor(private habitRepoService: HabitRepoService, private habitLogicService: HabitLogicService, private modalController: ModalController) { }

  ngOnInit(): void {
    if (!this.habit) {
      this.habit = this.habitRepoService.getNewHabit();
      this.habitDailyOrNone = new Observable(obs => obs.next(true));
    }
    else {
      this.origHabit = {... this.habit};
      this.habitFrequencyChanged(this.habit.FrequencyCategory);
      this.habit = this.origHabit;
    }

    this.resetReminder();
  }

  public habitFrequencyChanged(newFrequency: HabitFrequencyCategory) {
    this.habit.FrequencyCategoryValues = [];
    switch (newFrequency) {
      case HabitFrequencyCategory.Weekly: {
        this.habitDailyOrNone = new Observable(obs => obs.next(false));
        this.habitWeekly = new Observable(obs => obs.next(true));
        this.habitMonthly = new Observable(obs => obs.next(false));
        break;
      }
      case HabitFrequencyCategory.Monthly: {
        this.habitDailyOrNone = new Observable(obs => obs.next(false));
        this.habitWeekly = new Observable(obs => obs.next(false));
        this.habitMonthly = new Observable(obs => obs.next(true));
        break;
      }
      case HabitFrequencyCategory.Daily: 
      default: {
        this.habitDailyOrNone = new Observable(obs => obs.next(true));
        this.habitWeekly = new Observable(obs => obs.next(false));
        this.habitMonthly = new Observable(obs => obs.next(false));
        break;
      }
    }
  }
  
  public resetReminder() {
    this.currentReminder = this.habitRepoService.getNewHabitReminder(this.habit);
  }

  public editReminder(reminder: HabitReminder) {
    this.currentReminder = reminder;
  }

  public cancelReminder(reminder: HabitReminder) {
    this.habitLogicService.cancelReminder(reminder);
  }

  public saveReminder() {
    this.currentReminder.ReminderTime = this.currentReminder.ReminderTime.endsWith('Z') ? this.currentReminder.ReminderTime : this.currentReminder.ReminderTime + 'Z';
    
    if (this.habit.Reminders.indexOf(this.currentReminder) < 0) {
      this.habit.Reminders.push(this.currentReminder);
    }
  }

  public cancel() {
    this.habitRepoService.refreshHabitLists();      
    this.modal.dismiss();
  }

  public confirm() {
    if (!this.validateHabit())
      return;

    this.modal.dismiss(this.habit);
  }

  public validateHabit() : boolean {
    this.validationErrors = [];
    this.validationFailed = new Observable(obs => obs.next(false));

    if (!this.habit) {
      var validationError = new ValidationError();
      validationError.Name = 'UninstantiatedHabitSave';
      validationError.Field = 'Habit';
      validationError.Message = 'Cannot save an uninstantiated Habit.'
      this.validationErrors.push(validationError);
    }
    else {
      if (!this.habit.Name) {
        var validationError = new ValidationError();
        validationError.Name = 'HabitNameMissing';
        validationError.Field = 'Name';
        validationError.Message = 'Habit Name is required.'
        this.validationErrors.push(validationError);
      }
      else if (this.habit.Name.length > 40) {
        var validationError = new ValidationError();
        validationError.Name = 'HabitNameMaxLength';
        validationError.Field = 'Name';
        validationError.Message = 'Habit Name cannot be longer than 40 characters.'
        this.validationErrors.push(validationError);
      }
  
      if (this.habit.Type == undefined) {
        var validationError = new ValidationError();
        validationError.Name = 'HabitTypeMissing';
        validationError.Field = 'Type';
        validationError.Message = 'Habit Type is required.'
        this.validationErrors.push(validationError);
      }
  
      if (this.habit.FrequencyCategory  == undefined) {
        var validationError = new ValidationError();
        validationError.Name = 'HabitFrequencyCategoryMissing';
        validationError.Field = 'FrequencyCategory';
        validationError.Message = 'Habit Schedule is required.'
        this.validationErrors.push(validationError);
      }
      else if ((this.habit.FrequencyCategory == HabitFrequencyCategory.Weekly || this.habit.FrequencyCategory == HabitFrequencyCategory.Monthly)
        && (!this.habit.FrequencyCategoryValues || this.habit.FrequencyCategoryValues.length == 0)) {
        var validationError = new ValidationError();
        validationError.Name = 'HabitFrequencyCategoryValuesMissing';
        validationError.Field = 'FrequencyCategoryValues';
        validationError.Message = 'Habit Schedule Days is required when "Weekly" or "Monthly" is selected.'
        this.validationErrors.push(validationError);
      }
    }
    
    if (this.validationErrors.length > 0) {
      this.validationFailed = new Observable(obs => obs.next(true));
      return false;
    }

    return true;
  }

  public async changeIcon() {
    const modal = await this.modalController.create({
      component: IconSelectModalComponent,
      componentProps: { }
    })

    modal.onDidDismiss().then((event) => {
      if (event && event.data) {
        this.habit.Icon = event.data.name;
      }
    });

    return await modal.present();
  }
}
