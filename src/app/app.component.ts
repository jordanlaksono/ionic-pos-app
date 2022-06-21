import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { StorageProvider } from '../providers/storage/storage';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage:any = TabsPage;
  rootPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: StorageProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.cekIsLogin();
  }

  cekIsLogin(){
    this.storage.getStorage("user:data").then(data => {
      console.log("local", data)
      if(data && data.id_karyawan) {
        this.rootPage = TabsPage;
      }else{
        this.storage.removeStorage("user:data").then(data => {
          this.rootPage = LoginPage;
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
}
