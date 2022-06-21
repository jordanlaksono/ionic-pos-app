import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Printer, PrintOptions } from '@ionic-native/printer';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-piutang',
  templateUrl: 'piutang.html',
})
export class PiutangPage {

   userData;
  textCari
  nota;
  notaUi;
  notaPilih;
  jenisKeuanganUI = [];
  jenisKeuanganDebitUI = [];

  showPembayaran = false;

  segPembayaran = 'Bayar'
  jenisPembayaran: any = 0;
  potonganPembayaran = 0;
  jenisKeuangan;
  ketReturn;
  bayarKeuangan = 0;
  jenisKeuanganDebit;
  bayarKeuanganDebit = 0;
  jenisKeuanganTransfer;
  bayarKeuanganTransfer = 0;

  bayarReturn = 0;

  kembalianKekurangan = 0;

  ekspedisi = false;
  namaEkspedisi = "";
  noResi = "";
  biayaEkspedisi = 0;

  bayarLoading = false;

  modalShow = false;

  loadingPrint;
  notaPrintHtml;

  uang = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];

  gunakanSaldo = false;
  gunakanReturn = false;
  saldo = 0;
  biaya_return= 0;
  //keterangan;

  c = true;
  r = true;
  u = true;
  d = true;

  constructor(
    private platform: Platform,
  	private navCtrl: NavController,
  	private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private printer: Printer,
    private sanitized: DomSanitizer
  ) {
  }

  ionViewDidLoad() {
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      console.log("userdata", this.userData)
      let submenuPembayaran = data.submenu[(data.submenu.findIndex(v => v.link_sub == 'piutang'))];
      this.c = submenuPembayaran.c == '1';
      this.r = submenuPembayaran.r == '1';
      this.u = submenuPembayaran.u == '1';
      this.d = submenuPembayaran.d == '1';
      this.ambilDataNota();
    })
    // this.ambilDataNota();
     this.ambilKeuangan();
  }

  ambilDataNota(){
    let l = this.pesan.showLoading('Memuat Data Piutang');
  	this.server.pembayaranGetDataNotaPiutang().then(data => {
      // if(!this.c || !this.u) {
      //   data = data.filter(v => v.id_kary_pembuat_nota.toString() == this.userData.id_karyawan.toString());
      // }
      this.nota = data;
      this.notaUi = this.nota;
      l.dismiss();
      console.log(data);
    }).catch(err => {
      console.log(err)
      l.dismiss()
    })
  }

  pembayaran(){
 //     this.showPembayaran = true;
    // let namaPel = this.notaPilih.nama_pelanggan? this.notaPilih.nama_pelanggan : 'Umum'
     let loading = this.pesan.showLoading('Memuat Data !!!');
     this.saldo = 0;
     this.server.pembayaranGetSaldoPenjualan(this.notaPilih.kode_pelanggan).then(data => {
      this.notaPilih['saldo_pelanggan'] = data? Number(data.saldo) : 0;
      this.saldo = this.notaPilih.saldo_pelanggan;
      this.gunakanSaldo = this.saldo > 0? true : false;
     // console.log('gunakanReturn',this.gunakanReturn);
      // this.bayarKeuangan = this.notaPilih.saldo_pelanggan? 0 : (this.notaPilih.selisih * -1);
      loading.dismiss();
      this.showPembayaran = true;
     // console.log(this.saldo);
    }).catch(err => {
      loading.dismiss();
      this.notaPilih['saldo_pelanggan'] = 0;
      this.saldo = 0;
      this.pesan.showAlert("", "Gagal Memuat Data Return");
    })

    // this.saldo = 0;

  }

  modalBatal(){
    this.showPembayaran = false;
    // this.jenisPembayaran = 0;
    this.bayarKeuangan = 0;
    // this.bayarKeuanganDebit = 0;
    // this.bayarKeuanganTransfer = 0;
  }

  ambilKeuangan(){
    this.server.returnAmbilKeuangan().then(data => {
      this.jenisKeuanganUI = data;
      // this.jenisKeuangan = data;
      this.jenisKeuangan = data[data.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
     // console.log(data, data.findIndex(x => x.nama_keuangan.toLowerCase() === "kasir"))
    }).catch(err => {
      console.log(err)
    })
  }

  refresh(refresher){
    this.server.pembayaranGetDataNotaPiutang().then(data => {
      // if(!this.c || !this.u) {
      //   data = data.filter(v => v.id_kary_pembuat_nota.toString() == this.userData.id_karyawan.toString());
      // }
      this.nota = data;
      this.notaUi = this.nota;
      refresher.complete()
      console.log(data);
    }).catch(err => {
      console.log(err)
      refresher.complete()
    });
    this.ambilKeuangan();
    //this.ambilKeuanganDebit();
  }

  showNotaModal = false;
  lihatNota(){
    let l = this.pesan.showLoading('Memuat Nota ' + this.notaPilih.no_faktur);
    console.log('nota',this.notaPilih.id_penjualan);
    this.server.notaGetNotaBesar(this.notaPilih.id_penjualan).then(data => {
      l.dismiss();
      this.notaPrintHtml = this.sanitized.bypassSecurityTrustHtml(data);
      this.showNotaModal = true;
    })
  }

  bayar(){
    this.bayarLoading = true;
    // console.log('this.jenisKeuangan',this.jenisKeuangan);
    // console.log('this.jenisKeuanganDebit',this.jenisKeuanganDebit);
    let dataKirim = {
      dariAplikasi: true,
      operator: this.userData.id_karyawan,
      nama_keuangan: this.jenisKeuangan.kode_nama_keuangan,
      no_nota: this.notaPilih.no_nota,
      status_pakai: this.gunakanSaldo? 'Yes' : 'No',
      belum_bayarne : this.notaPilih.selisih,
      keterangan_tagihan : this.ketReturn,
      kode_pelanggan: this.notaPilih.kode_pelanggan? this.notaPilih.kode_pelanggan : "",
      cash: this.bayarKeuangan,
      Total: this.notaPilih.selisih,
      GrandTotal: this.notaPilih.total_harga,
      biayaTotal: this.notaPilih.biaya,
      return_pakai : this.biaya_return,
      UangSaldo: this.saldo,
      simpan: true

      // id_pelanggan: this.notaPilih.id_pelanggan? this.notaPilih.id_pelanggan : "",


      // id_penjualanne: this.notaPilih.id_penjualan,
      // metode_pembayaran: this.jenisPembayaran,
      // BiayaKirim: this.biayaEkspedisi,
      // Potongan: this.potonganPembayaran,

    }

    this.server.pembayaranBayarPiutang(dataKirim).then(data => {
      this.bayarLoading = false;
      try{
        data = JSON.parse(data);
      }catch{
        console.log('error parse json - pembayaranBayar');
      }
      console.log(data);
      if(data.success){
        this.afterSimpan();

      }else{
        this.pesan.showToast('Pembayaran Gagal', 'bottom', 'danger');
        this.bayarLoading = false;
      }
    }).catch(err => {
      console.log(err);
      this.pesan.showToast('Pembayaran Gagal', 'bottom', 'danger');
      this.bayarLoading = false;
      this.ambilDataNota();
    })
  }

  afterSimpan(){
    this.showPembayaran = false;
    this.ambilDataNota();
    this.notaPilih = null;
  //  this.jenisPembayaran = 0;
    //this.biayaEkspedisi = 0;
    //this.potonganPembayaran = 0;
    this.jenisKeuangan = this.jenisKeuanganUI[this.jenisKeuanganUI.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
    this.bayarKeuangan = 0;

    this.modalShow = false;
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
