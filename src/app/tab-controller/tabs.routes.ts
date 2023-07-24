import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../tabs/home-tab/home.page').then((m) => m.HomePage),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('../tabs/calendar-tab/calendar.page').then((m) => m.CalendarPage),
      },
      {
        path: 'more',
        loadComponent: () =>
          import('../tabs/more-tab/more.page').then((m) => m.MorePage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
