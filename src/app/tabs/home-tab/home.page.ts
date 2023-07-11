import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HabitListComponent } from 'src/app/components/habit-list/habit-list.component';
import { HabitManagerComponent } from 'src/app/components/habit-manager/habit-manager.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, HabitListComponent, HabitManagerComponent, CommonModule],
  providers: []
})
export class HomePage {
  constructor() {}
}
