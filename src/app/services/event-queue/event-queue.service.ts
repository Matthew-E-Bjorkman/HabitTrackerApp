import { Injectable } from '@angular/core';
import { Observable, Subject, filter } from 'rxjs';
import { AppEvent, AppEventType } from 'src/app/shared/events';

@Injectable({
  providedIn: 'root'
})
export class EventQueueService {

  private eventBrocker = new Subject<AppEvent<any>>();

  on(eventType: AppEventType): Observable<AppEvent<any>> {
    return this.eventBrocker.pipe(filter(event => event.type === eventType));
  }

  dispatch<T>(event: AppEvent<T>): void {
    this.eventBrocker.next(event);
  }

}