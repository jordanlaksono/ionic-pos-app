import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Printer, PrintOptions } from '@ionic-native/printer';

import { ServerProvider } from '../../providers/server/server';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

declare const cordova;

@Component({
  selector: 'page-nota',
  templateUrl: 'nota.html'
})
export class NotaPage {

  dataHasilCari;
  dataHasilCariUi;
  pilihanCari = 3;
  textCari;
  notaPilih;
  notaPrint;
  notaPrintHtml;

  showNotaModal = false;

  loading;


  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private server: ServerProvider,
    private pesan: PesanProvider,
    private sanitized: DomSanitizer,
    private printer: Printer
    ) {
  }

  ionViewDidLoad(){
    // this.pesan.showToast("Tarik kebawah untuk memuat ulang data nota", 'top', 'normal', 4000)
    this.getAllNota();
  }


  getAllNota(){
    let l = this.pesan.showLoading('Memuat Data Barang');
    this.server.returnGetDataCari("", 33).then(data => {
      l.dismiss();
      this.dataHasilCari = data;
      // this.dataHasilCari.sort((a,b) => (a.date == b.date)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0));
      this.dataHasilCariUi = this.dataHasilCari;
      console.log(data, 'getAllNota - NotaPage');
    }).catch(err => {
      l.dismiss();
      console.log(err);
      this.pesan.showToast("Galal Memuat Data Nota");
    })
  }

  inputPress(e){
  }
  cariOnInput(){
    let katCari = this.pilihanCari == 3? 'no_faktur' : this.pilihanCari == 4? 'kode_pelanggan' : 'nama';
    this.dataHasilCariUi = this.dataHasilCari.filter(v => {
      return v[katCari].toLowerCase().includes(this.textCari.toLowerCase());
    })
  }
  cariOnCancel(){
    this.getAllNota()
  }

  refresh(refresher){
    this.server.returnGetDataCari("", 33).then(data => {
      refresher.complete();
      this.dataHasilCari = data;
      this.dataHasilCari.sort((a,b) => (a.date == b.date)? ((a.time > b.time)? -1 : (a.time > b.time)? 1 : 0) : (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0));
      this.dataHasilCariUi = this.dataHasilCari;
      console.log(data, 'getAllNota - NotaPage');
    }).catch(err => {
      refresher.complete();
      console.log(err);
      this.pesan.showToast("Galal Memuat Data Nota");
    })
  }

  pilihNota(c){
    console.log(c, 'pilihNota - NotaPage');
    this.notaPrint = null;
    this.notaPilih = c;
    let option = [{
      name: 'notakecil',
      value: 'notakecil',
      type: 'radio',
      label: 'Nota Kecil',
      checked: true
    }, {
      name: 'notabesar',
      value: 'notabesar',
      type: 'radio',
      label: 'Nota Besar'
    }];
    this.pesan.showOption("Pilih Jenis Nota", option).then(data => {
      if(!data.data) return;
      this.loading = this.pesan.showLoading('Memuat Nota ' + c.no_faktur);
      if(data.data == 'notakecil'){
        this.ambilNotaKecil(c);
      }else{
        this.ambilNotaBesar(c);
      }
    }).catch(err => {
      console.log(err);
    })

  }

  ambilNotaKecil(c){

    this.server.notaGetNotaKecil(c.id_penjualan).then(data => {
      this.notaPrintHtml = data;
      this.printNota('A6');

      // this.showNotaModal = true;
      // data = data.split('<script')[0]
      // this.notaPrint = this.sanitized.bypassSecurityTrustHtml(data);
      // console.log(this.notaPrintHtml, 'notaGetNotaKecil - ambilNotaKecil');
    }).catch(err => {
      this.loading.dismiss();
      console.log(err, 'err notaGetNotaKecil - ambilNotaKecil');
    })
  }

  ambilNotaBesar(c){
    this.server.notaGetNotaBesar(c.id_penjualan).then(data => {
      this.notaPrintHtml = data;
      this.printNota('A4');

      // this.showNotaModal = true;
      // data = data.split('<script')[0]
      // this.notaPrint = this.sanitized.bypassSecurityTrustHtml(data);
      // console.log(this.notaPrintHtml, 'notaGetNotaBesar - ambilNotaBesar');
    }).catch(err => {
      this.loading.dismiss();
      console.log(err, 'err notaGetNotaBesar - ambilNotaBesar');
    })
  }

  printNota(ukuran){
    if(this.platform.is('cordova')){
      this.printer.print(this.notaPrintHtml).then(data => {
        console.log(data, 'print');
        this.loading.dismiss();
      }).catch(err => {
        console.log(err, 'err print');
        this.loading.dismiss();
      })
    }else{
      this.loading.dismiss();
      this.pesan.showToast("device tidak mendukung print")
    }
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
