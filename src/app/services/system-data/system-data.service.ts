import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SysIcon } from 'src/app/shared/system-classes/system-objects';

@Injectable({
  providedIn: 'root'
})
export class SystemDataService {
  initialized: boolean = false;
  icons!: SysIcon[];

  constructor(private http: HttpClient) { }

  private loadIcons(callback: (param: SysIcon[]) => void) {
    return this.http.get('./assets/system-data/icons.json')
      .subscribe((result: any) => {
            this.icons = result.icons;
            this.initialized = true;
            callback(this.icons);
      })
  }

  public getIcons(callback: (param: SysIcon[]) => void) {
      //give the service a chance to initialize
      if (!this.initialized) {
        this.loadIcons(callback);
      }
      else {
        callback(this.icons);
      }
  }
}

