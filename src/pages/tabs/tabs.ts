import { Nav } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular';

import { PembelianPage } from '../pembelian/pembelian';
import { PenjualanPage } from '../penjualan/penjualan';
import { PembayaranPage } from '../pembayaran/pembayaran';
import { ProdukPage } from '../produk/produk';
import { ReturnPage } from '../return/return';
import { NotaPage } from '../nota/nota';
import { TransaksiPage } from '../transaksi/transaksi';
import { KasbonPage } from '../kasbon/kasbon';
import { PiutangPage } from '../piutang/piutang';
import { LoginPage } from '../login/login';

import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild("tabs") tabs: Tabs;

  tab1Root: any = PenjualanPage;
  tab2Root: any = PembelianPage;
  tab3Root: any = PembayaranPage;
  tab4Root: any = ProdukPage;
  tab5Root: any = ReturnPage;
  tab6Root: any = NotaPage;
  tab7Root: any = TransaksiPage;
  tab8Root: any = PiutangPage;
  tab9Root: any = KasbonPage;

  title1 = "Penjualan";
  title2 = "Pembayaran";
  title3 = "Bpb";
  title4 = "Barang";
  title5 = "Return";
  title6 = "Print";
  title7 = "Transaksi";
  title8 = "Piutang";
  title9 = "Kasbon";

  icon1 = "md-clipboard";
  icon2 = "md-cash";
  icon3 = "md-cart";
  icon4 = "md-cube";
  icon5 = "md-exit";
  icon6 = "md-print";
  icon7 = "md-git-compare";
  icon8 = "md-closed-captioning";
  icon9 = "md-card";

  tab1 = true;
  tab2 = true;
  tab3 = true;
  tab4 = true;
  tab5 = true;
  tab6 = true;
  tab7 = true;
  tab8 = true;
  tab9 = true;

  userData;

  constructor(
    private nav: Nav,
    private storage: StorageProvider,
    private pesan: PesanProvider
  ) {
    storage.getStorage('user:data').then(data => {
      console.log('datane', data.submenu);
      this.userData = data;
      this.tab1 = data.submenu[0].r == '1';
      this.tab2 = data.submenu[1].r == '1';
      this.tab3 = data.submenu[2].r == '1';
      this.tab4 = data.submenu[3].r == '1';
      this.tab5 = data.submenu[4].r == '1';
      this.tab6 = data.submenu[5].r == '1';
      this.tab7 = data.submenu[6].r == '1';
      this.tab8 = data.submenu[7].r == '1';
      this.tab9 = data.submenu[8].r == '1';
     // this.tab8 = data.submenu[7].r == '1';
      // this.tab4Root = KasbonPage;
      // this.title4 = "Kas Bon";
      // this.icon4 = "logo-bitcoin";
      let v = this.userData.submenu.find(v => v.r == '1');
      this.tabs.select(this.userData.submenu.indexOf(v));

      let submenuPembayaran = data.submenu[(data.submenu.findIndex(v => v.link_sub == 'pembayaran'))];
      this.title2 = submenuPembayaran.c != '1' || submenuPembayaran.u != '1'? 'Nota' : 'Pembayaran';
      this.icon2 = submenuPembayaran.c != '1' || submenuPembayaran.u != '1'? 'md-copy' : 'md-cash';
    })
  }

  logout(){
    this.pesan.showConfirm("Yakin Ingin Keluar?", '').then(data => {
      if(data){
        this.storage.removeStorage("user:data").then(data => {
      	  this.nav.setRoot(LoginPage);
        })
      }
    })
  }
}
