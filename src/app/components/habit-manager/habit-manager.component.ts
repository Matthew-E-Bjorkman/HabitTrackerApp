import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { AppEventType } from 'src/app/shared/events';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormsModule } from '@angular/forms';
import { SystemDataService } from 'src/app/services/system-data/system-data.service';
import { SysIcon } from 'src/app/shared/system-classes/system-objects';
import { IconSelectModalComponent } from '../icon-select-modal/icon-select-modal.component';

@Component({
  selector: 'app-habit-manager',
  templateUrl: './habit-manager.component.html',
  styleUrls: ['./habit-manager.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, IconSelectModalComponent]
})
export class HabitManagerComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  habits!: Habit[];
  habit: Habit = new Habit();
  addingHabit: boolean = false;
  sysIcons!: SysIcon[];

  constructor(private habitService: HabitService, private eventQueueService: EventQueueService, private systemDataService: SystemDataService) { }

  ngOnInit(): void {
    this.habit.Icon = 'checkmark-circle-outline';
    this.getHabits();
    this.getIcons();
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(event => this.getHabits());
  }

  private getIcons() {
    this.systemDataService.getIcons((result) => {
      if (result) {
        this.sysIcons = result;
      }
    });
  }

  private getHabits() {
    this.habitService.getHabits((result) => {
      if (result) {
        this.habits = result;
      }
    });
  }

  public modalEnabled() {
    return this.addingHabit;
  }

  public iconSelectionChanged(icon: SysIcon) {
    this.habit.Icon = icon.name;
  }

  public createHabit() {
    this.habitService.saveHabit(this.habit);
  }

  public deleteHabit(habit: Habit) {
    this.habitService.deleteHabit(habit);
  }

  public cancel() {
    this.modal.dismiss('false', 'cancel');
  }

  public confirm() {
    this.modal.dismiss('true', 'confirm');
  }

  public onWillPresent(event: Event) {
    this.addingHabit = true;
  }

  public onWillDismiss(event: Event) {
    this.addingHabit = false;
    if ((event as CustomEvent<OverlayEventDetail<string>>).detail.data === 'true') {
      this.createHabit();
    }
    this.habit = new Habit();
    this.habit.Icon = 'checkmark-circle-outline';
  }
}
