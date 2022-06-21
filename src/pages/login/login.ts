import { Component } from '@angular/core';
import { NavController, Nav } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';
import { TabsPage } from '../tabs/tabs';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  username = '';
  password = '';

  masukLoading = false;

  constructor(
    public navCtrl: NavController,
    public nav: Nav,
    public server: ServerProvider,
    public storage: StorageProvider,
    private pesan: PesanProvider) {
  }

  login(){
    this.masukLoading = true;
    // console.log(this.username, this.password)
    this.server.login(this.username, this.password).then(data => {
      data = JSON.parse(data);
      console.log("login after parse", data);
      if(data.success == 'success'){
        this.masukLoading = false;
        data.data['submenu'] = data.submenu;
        data.data['posisi'] = data.posisi;
        if(data.submenu.lenght < 1) return this.pesan.showAlert('Gagal Masuk', 'Anda tidak memiliki akses.')
        this.storage.setStorage("user:data", data.data).then(data => {
          this.nav.setRoot(TabsPage);
        })
      }else{
        this.masukLoading = false;
        this.pesan.showToast("Terjadi kesalahan, Hubungi pengembang aplikasi.", 'bottom', 'danger')
      }
    }).catch(err => {
      console.log(err);
      this.masukLoading = false;
      // this.pesan.showToast(JSON.stringify(err), 'bottom', 'danger', 8000);
      this.pesan.showAlert("error login", JSON.stringify(err))
      // this.pesan.showToast("Gagal Masuk, Coba Lagi.", 'bottom', 'danger')
    })
  }

  setting(){
    this.pesan.changeServerUrl().then(data => {
      console.log(data, 'changeServerUrl - setting - LoginPage');
      this.server.setServerUrl(data);
    }).catch(err => {
      console.log(err, 'err changeServerUrl - setting - LoginPage')
    })
  }

}
