import { Component, OnInit } from '@angular/core';
import { AdMob, AdMobBannerSize, BannerAdOptions, BannerAdPluginEvents, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

@Component({
  selector: 'app-ad-banner',
  templateUrl: './ad-banner.component.html',
  styleUrls: ['./ad-banner.component.scss'],
  standalone: true
})
export class AdBannerComponent  implements OnInit {

  constructor() {
    this.init();
  }

  async init() {
    AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['1736cc1b-0b42-4b99-ba37-10ca1ad1abe1'],
      initializeForTesting: true
    }).then(() => {
      const adId = 'ca-app-pub-9497540219544165/4062095631';
  
      const options: BannerAdOptions = {
        adId: adId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.TOP_CENTER,
        margin: 75,
        isTesting: true
      };
      AdMob.showBanner(options);
    });
  }

  ngOnInit() { }

}
