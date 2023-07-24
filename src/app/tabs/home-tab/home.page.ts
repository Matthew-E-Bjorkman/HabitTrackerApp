import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HabitListComponent } from 'src/app/components/habit-list/habit-list.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, HabitListComponent, CommonModule],
  providers: []
})
export class HomePage {
  constructor() {}
}
