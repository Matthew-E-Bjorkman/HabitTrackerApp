import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SysIcon } from 'src/app/shared/system-classes/system-objects';

@Injectable({
  providedIn: 'root'
})
export class SystemDataService {
  initialized: boolean = false;
  icons!: SysIcon[];
  iconsReduced!: SysIcon[];

  constructor(private http: HttpClient) { 
    this.loadIcons(() => {});
  }

  private loadIcons(callback: (param: SysIcon[]) => void) {
    return this.http.get('./assets/system-data/icons.json')
      .subscribe((result: any) => {
            this.icons = result.icons;
            this.initialized = true;
            callback(this.icons);
            this.createReducedList();
      })
  }

  private createReducedList() {
    this.iconsReduced = this.icons.filter((icon) => {
      if (icon.name.endsWith('-outline')) return false;
      if (icon.name.endsWith('-sharp')) return false;
      return true;
    });
  }

  public getIcons(callback: (param: SysIcon[]) => void, getAll: boolean = false) {
      //give the service a chance to initialize
      if (!this.initialized) {
        this.loadIcons(() => {
          if (getAll) {
            callback(this.icons);
          }
          else {
            callback(this.iconsReduced);
          }
        });
      }
      else {
        if (getAll) {
          callback(this.icons);
        }
        else {
          callback(this.iconsReduced);
        }
      }
  }
}

