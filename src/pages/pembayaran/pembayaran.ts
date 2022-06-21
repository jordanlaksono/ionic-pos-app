import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Printer, PrintOptions } from '@ionic-native/printer';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-pembayaran',
  templateUrl: 'pembayaran.html'
})
export class PembayaranPage { 
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
  bayarKeuangan = 0;
  jenisKeuanganDebit;
  bayarKeuanganDebit = 0;
  jenisKeuanganTransfer;
  bayarKeuanganTransfer = 0;

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
  saldo = 0;

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
    private sanitized: DomSanitizer,) {
  }

  ionViewDidLoad(){
    // this.pesan.showToast("Tarik kebawah untuk memuat ulang nota", 'top', 'normal', 4000)
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      console.log("userdata", this.userData)
      let submenuPembayaran = data.submenu[(data.submenu.findIndex(v => v.link_sub == 'pembayaran'))];
      this.c = submenuPembayaran.c == '1';
      this.r = submenuPembayaran.r == '1';
      this.u = submenuPembayaran.u == '1';
      this.d = submenuPembayaran.d == '1';
      this.ambilDataNota();
    })
    this.ambilKeuangan();
    this.ambilKeuanganDebit();
  }

  ambilDataNota(){
    let l = this.pesan.showLoading('Memuat Data Pembayaran');
  	this.server.pembayaranGetDataNota().then(data => {
      if(!this.c || !this.u) {
        data = data.filter(v => v.id_kary_pembuat_nota.toString() == this.userData.id_karyawan.toString());
      }
      this.nota = data;
      this.notaUi = this.nota;
      l.dismiss();
      console.log(data);
    }).catch(err => {
      console.log(err)
      l.dismiss()
    })
  }

  ambilKeuangan(){
    this.server.pembayaranGetDataKeuangan().then(data => {
      this.jenisKeuanganUI = data;
      this.jenisKeuangan = data[data.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
      console.log(data, data.findIndex(x => x.nama_keuangan.toLowerCase() === "kasir"))
    }).catch(err => {
      console.log(err)
    })
  }

  ambilKeuanganDebit(){
    this.server.pembayaranGetDataKeuanganDebit().then(data => {
      this.jenisKeuanganDebitUI = data;
      this.jenisKeuanganDebit = data[data.findIndex(x => x.nama_keuangan.toLowerCase() === "bca rek lama")]
      this.jenisKeuanganTransfer = data[data.findIndex(x => x.nama_keuangan.toLowerCase() === "bca rek baru")]
      console.log(data)
    }).catch(err => {
      console.log(err)
    })
  }

  tutupHarian(){
    this.pesan.showConfirm('Tutup Harian', 'Apakah anda yakin tutup harian sekarang?').then(data => {
      let l = this.pesan.showLoading("Tutup Pembukuan Hari Ini");
      if(data){
        this.server.tutupHarian().then(data => {
          l.dismiss();
        })
      }
    })
    // this.pesan.showInput("Tutup Harian", "Masukkan Password Tutup Harian?", [{
    //   name: 'password',
    //   placeholder: 'Password Tutup Harian',
    //   type: 'password'
    // }]).then(data => {
    //   console.log(data);
    // }).catch(err => {
    //   console.log(err);
    // })
  }

  inputPress(e){
    if((e.key == "Enter" || e.keyCode == 13) && this.textCari){
      if(this.notaUi.length == 1){
        this.notaPilih = this.notaUi[0]
      }
      e.target.select();
    }
  }
  cariOnInput(e){
    this.notaUi = this.nota.filter(v => {
      return v.no_nota.toLowerCase().includes(this.textCari.toLowerCase())
    })
    console.log(this.notaUi)
  }
  cariOnCancel(){}

  refresh(refresher){
    this.server.pembayaranGetDataNota().then(data => {
      if(!this.c || !this.u) {
        data = data.filter(v => v.id_kary_pembuat_nota.toString() == this.userData.id_karyawan.toString());
      }
      this.nota = data;
      this.notaUi = this.nota;
      refresher.complete()
      console.log(data);
    }).catch(err => {
      console.log(err)
      refresher.complete()
    });
    this.ambilKeuangan();
    this.ambilKeuanganDebit();
  }

  pembayaran(){
    let namaPel = this.notaPilih.nama_pelanggan? this.notaPilih.nama_pelanggan : 'Umum'
    let loading = this.pesan.showLoading('Memuat Data Top Pelanggan "' + namaPel + '"');
    this.saldo = 0;
    this.server.pembayaranGetDataTop(this.notaPilih.id_pelanggan).then(data => {
      console.log(data);
      if(data && data['jum_top']){
        data['jum_top'] = Number(data['jum_top']);
      }
      // this.notaPilih['selisih'] = this.notaPilih['selisih'];
      this.notaPilih['top_pelanggan'] = data;

      this.server.pembayaranGetSaldoPelanggan(this.notaPilih.kode_pelanggan).then(data => {
        this.notaPilih['saldo_pelanggan'] = data? Number(data.saldo) : 0;
        this.saldo = this.notaPilih.saldo_pelanggan;
        this.gunakanSaldo = this.saldo > 0? true : false;
        // this.bayarKeuangan = this.notaPilih.saldo_pelanggan? 0 : (this.notaPilih.selisih * -1);
        loading.dismiss();
        this.showPembayaran = true;
        console.log(this.saldo);
      }).catch(err => {
        loading.dismiss();
        this.notaPilih['saldo_pelanggan'] = 0;
        this.saldo = 0;
        this.pesan.showAlert("", "Gagal Memuat Data Saldo Pelanggan " + namaPel);
      })

    }).catch(err => {
      loading.dismiss();
      this.saldo = 0;
      // this.pesan.showToast("Gagal Memuat Data Top Pelanggan " + namaPel);
      this.pesan.showAlert("", "Gagal Memuat Data Top Pelanggan" + namaPel);
      console.log(err);
    })
  }

  jenisPembayaranChange(){
    if(this.saldo){
      this.bayarKeuangan = 0;
      this.bayarKeuanganDebit = 0;
      this.bayarKeuanganTransfer = 0;
      return;
    }
    this.bayarKeuangan = this.jenisPembayaran == 'cash' || this.jenisPembayaran == 'cash_debit'? (this.notaPilih.selisih * -1) : 0;
    this.bayarKeuanganDebit = this.jenisPembayaran == 'debit' || this.jenisPembayaran == 'debit_transfer'? (this.notaPilih.selisih * -1) : 0;
    this.bayarKeuanganTransfer = this.jenisPembayaran == 'transfer'? (this.notaPilih.selisih * -1) : 0;
  }

  checkTop(){
    return ((this.potonganPembayaran + this.bayarKeuangan + this.bayarKeuanganDebit + this.bayarKeuanganTransfer) -
      (this.notaPilih['selisih'] * -1) - this.biayaEkspedisi) < 0 &&
      Number(this.notaPilih['top_pelanggan']['jum_top']) >= 3 &&
      (this.bayarKeuangan > 0 || this.bayarKeuanganDebit > 0 || this.bayarKeuanganTransfer > 0)
  }

  modalBatal(){
    this.showPembayaran = false;
    this.jenisPembayaran = 0;
    this.bayarKeuangan = 0;
    this.bayarKeuanganDebit = 0;
    this.bayarKeuanganTransfer = 0;
  }

  bayar(){
    this.bayarLoading = true;
    // console.log('this.jenisKeuangan',this.jenisKeuangan);
    // console.log('this.jenisKeuanganDebit',this.jenisKeuanganDebit);
    let dataKirim = {
      dariAplikasi: true,
      operator: this.userData.id_karyawan,
      Total: this.notaPilih.selisih,
      GrandTotal: this.notaPilih.total_harga,
      biayaTotal: this.notaPilih.biaya,
      id_pelanggan: this.notaPilih.id_pelanggan? this.notaPilih.id_pelanggan : "",
      kode_pelanggan: this.notaPilih.kode_pelanggan? this.notaPilih.kode_pelanggan : "",
      no_nota: this.notaPilih.no_nota,
      id_penjualanne: this.notaPilih.id_penjualan,
      metode_pembayaran: this.jenisPembayaran,
      BiayaKirim: this.biayaEkspedisi,
      Potongan: this.potonganPembayaran,
      nama_keuangan: this.jenisKeuangan.kode_nama_keuangan,
      cash: this.bayarKeuangan,
      nama_keuangan2: this.jenisKeuanganDebit.kode_nama_keuangan,
      cash_debit: this.bayarKeuanganDebit,
      nama_keuangan3: this.jenisKeuanganTransfer.kode_nama_keuangan,
      cash_transfer: this.bayarKeuanganTransfer,
      ekspedisi: this.namaEkspedisi,
      no_resi: this.noResi,
      UangSaldo: this.saldo,
      status_pakai: this.gunakanSaldo? 'Yes' : 'No',
      simpan: true
    }

    this.server.pembayaranBayar(dataKirim).then(data => {
      this.bayarLoading = false;
      try{
        data = JSON.parse(data);
      }catch{
        console.log('error parse json - pembayaranBayar');
      }
      console.log(data);
      if(data.success){
        // this.pesan.showConfirm('Berhasil', 'Pembayaran Telah Berhasil Dilakukan, Print Nota Sekarang?', 'Ya, Print Nota').then(data => {

        //   if(data){
            this.saldo = 0;
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
              if(!data.data) return this.afterSimpan();
              this.loadingPrint = this.pesan.showLoading('Memuat Nota ' + this.notaPilih.no_faktur);
              if(data.data == 'notakecil'){
                this.ambilNotaKecil();
              }else{
                this.ambilNotaBesar();
              }
              this.afterSimpan();

            }).catch(err => {
              console.log(err);
            })
        //   }else{
        //     this.afterSimpan()
        //   }
        // }).catch(err => {
        //   console.log(err)
        //   this.afterSimpan();
        // })
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
    this.jenisPembayaran = 0;
    this.biayaEkspedisi = 0;
    this.potonganPembayaran = 0;
    this.jenisKeuangan = this.jenisKeuanganUI[this.jenisKeuanganUI.findIndex(x => x.nama_keuangan.toLowerCase() == 'kasir')];
    this.bayarKeuangan = 0;
    this.jenisKeuanganDebit = this.jenisKeuanganDebitUI[this.jenisKeuanganDebitUI.findIndex(x => x.nama_keuangan.toLowerCase() === "tabungan")]
    this.bayarKeuanganDebit = 0;
    this.jenisKeuanganTransfer = this.jenisKeuanganDebitUI[this.jenisKeuanganDebitUI.findIndex(x => x.nama_keuangan.toLowerCase() === "tabungan")];
    this.bayarKeuanganTransfer = 0;
    this.namaEkspedisi = '';
    this.noResi = '';
    this.modalShow = false;
  }

  ambilNotaKecil(){
    this.server.notaGetNotaKecil(this.notaPilih.id_penjualan).then(data => {
      this.notaPrintHtml = data;
      this.printNota('A6');
      // console.log(data, 'notaGetNotaKecil - ambilNotaKecil - PembayaranPage')
    }).catch(err => {
      this.loadingPrint.dismiss();
      console.log(err, 'err notaGetNotaKecil - ambilNotaKecil');
    })
  }

  ambilNotaBesar(){
    this.server.notaGetNotaBesar(this.notaPilih.id_penjualan).then(data => {
      this.notaPrintHtml = data;
      this.printNota('A4');
      console.log(data, 'notaGetNotaKecil - ambilNotaKecil - PembayaranPage')
    }).catch(err => {
      this.loadingPrint.dismiss();
      console.log(err, 'err notaGetNotaBesar - ambilNotaBesar');
    })
  }

  printNota(ukuran){
    if(this.platform.is('cordova')){
      this.printer.print(this.notaPrintHtml).then(data => {
        console.log(data, 'print');
        this.loadingPrint.dismiss();
      }).catch(err => {
        console.log(err, 'err print');
        this.loadingPrint.dismiss();
      })
    }else{
      this.loadingPrint.dismiss();
      this.pesan.showToast("device tidak mendukung print")
    }
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

  setting(){
    this.pesan.changeServerUrl().then(data => {
      console.log(data, 'changeServerUrl - setting - LoginPage');
      this.server.setServerUrl(data);
    }).catch(err => {
      console.log(err, 'err changeServerUrl - setting - LoginPage')
    })
  }
}
