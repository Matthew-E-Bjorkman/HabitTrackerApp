import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HabitCalendarComponent } from 'src/app/components/habit-calendar/habit-calendar.component';

@Component({
  selector: 'app-calendar',
  templateUrl: 'calendar.page.html',
  styleUrls: ['calendar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HabitCalendarComponent]
})
export class CalendarPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
