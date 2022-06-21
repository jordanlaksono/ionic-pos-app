import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {sprintf} from "sprintf-js";

import { Printer, PrintOptions } from '@ionic-native/printer';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

//@IonicPage()
@Component({
  selector: 'page-kasbon',
  templateUrl: 'kasbon.html',
})
export class KasbonPage {
  kasbon = [];
  kasbonUI = [];
  userData;
  noVoucher;
  keuangan;
  operator;
  textCariKeuangan;
  textCari;

 // kode_karyawan = '';

  jenisKeuanganUI = [];
  jenisKeuangan = [];
  openModalAdd;
  keuanganUi = 0;

  Karyawan = [];
  simpanLoading = false;
  showModalKeuangan = false;

  kasbonPilih = {
    nama : '0',
    id_penyesuaian: 'tambah_kasbon',
    jumlah: '',
    karyawan_id: '0',
    no_voucher: '',
    id_operator: '',
    id_keuangan: '',
    // nama_ekspedisi: '',
    // biaya_ekspedisi: '',
    // image: '',
  };

//   baru_no_voucher = '';
//   baru_nama: any = 0;
//   baru_nama_keuangan: any = 0;
//  // baru_nama_penyesuaian = '';
//   baru_jumlah = '';
  //baru_keuangan = '';

  // baru_nama_sisa_hutang = '';

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
      this.operator = this.userData;
      console.log("userdata", this.userData)
      let submenuPembayaran = data.submenu[(data.submenu.findIndex(v => v.link_sub == 'piutang'))];
      this.c = submenuPembayaran.c == '1';
      this.r = submenuPembayaran.r == '1';
      this.u = submenuPembayaran.u == '1';
      this.d = submenuPembayaran.d == '1';
      //this.ambilDataNota();
    })
     this.ambilKaryawan();
     this.ambilKeuangan();
     this.getDataKasbon();
     //this.ambilDataVoucher();
  }

  getDataKasbon(){
    let l = this.pesan.showLoading('Memuat Data Kasbon');
    this.server.GetDataKasbon().then(data => {
      l.dismiss();
      if(this.textCari) return;
      this.kasbonUI = data;
      this.kasbon = data;
      //this.bpbUi = this.bpb.sort((a,b) => (a.tanggal == b.tanggal)? ((a.waktu > b.waktu)? -1 : (a.waktu > b.waktu)? 1 : 0) : (a.tanggal > b.tanggal) ? -1 : ((b.tanggal > a.tanggal) ? 1 : 0));
      console.log(data)
    }).catch(err => {
      l.dismiss();
      this.pesan.showToast("Gagal Memuat Data Kasbon")
      console.log(err)
    })
  }

  ambilKeuangan(){
    this.server.returnAmbilKeuangan().then(data => {
      this.jenisKeuanganUI = data;
      // this.jenisKeuangan = data;
      this.jenisKeuangan = data;
     // console.log(data, data.findIndex(x => x.nama_keuangan.toLowerCase() === "kasir"))
    }).catch(err => {
      console.log(err)
    })
  }

  ambilKaryawan(){
    this.server.AmbilKaryawan().then(data => {
      this.Karyawan = data;
    }).catch(err => {
      console.log(err)
    })
  }

  tambahKasbon(){
   // this.openModalAdd = true;
    let loading = this.pesan.showLoading('Memuat Data !!!');

    this.server.getNoVoucher().then((data) => {
      let urut;
      let char = "VOU";
      console.log('data',data.maxs);
      if(!data.maxs){
          data.maxs = char+"000";
      }


      urut = data.maxs.substring(3, 6);
      console.log('data'+urut);

      urut++;
      this.noVoucher = char+sprintf("%03s", urut);

      loading.dismiss();
      this.openModalAdd = true;
    }).catch(err => {
      loading.dismiss();
      // this.notaPilih['saldo_pelanggan'] = 0;
      // this.saldo = 0;
      this.pesan.showAlert("", "Gagal Memuat Data");
    });
  }

  setting(){
    this.pesan.changeServerUrl().then(data => {
      console.log(data, 'changeServerUrl - setting - LoginPage');
      this.server.setServerUrl(data);
    }).catch(err => {
      console.log(err, 'err changeServerUrl - setting - LoginPage')
    })
  }

  ambilDataVoucher(){
    this.server.getNoVoucher().then((data) => {
      let urut;
      let char = "VOU";
      if(!data.no_voucher){
          data.no_voucher = char+'-'+"000";
      }
      console.log('data.no_voucher'+data.no_voucher);
      urut = data.no_voucher.substring(3, 3);

      urut++;
      this.noVoucher = char+''+sprintf("%03s", urut);
    });
  }

  hideModelAdd(){
    this.openModalAdd = false;
   // this.baru_nama = '';
   // this.baru_keuangan = '';
   // this.baru_kode_keuangan = '';
   // this.baru_nama_penyesuaian = 0;
   // this.baru_jumlah = '';
  }

  openModalKeuangan(){
    this.showModalKeuangan = true;
  }

  inputPress(e){
    if((e.key == "Enter" || e.keyCode == 13) && this.textCari){
      if(this.kasbonUI.length == 1){
        // this.bpbPilih = this.bpbUi[0]
      }
      e.target.select();
    }
  }

  cariOnInput(e){
    if(!this.textCari || this.textCari == '') return this.kasbonUI = this.kasbon;
    this.kasbonUI = this.kasbon.filter(v => {
      return v.kode_karyawan.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.nama.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.no_voucher.toLowerCase().includes(this.textCari.toLowerCase())
    })
    console.log(this.kasbonUI)
  }

  cariOnCancel(){}

  refresh(refresher){
    this.server.GetDataKasbon().then(data => {
      refresher.complete();
      this.kasbonUI = data;
      this.kasbon = data;

      console.log(data)
    }).catch(err => {
      refresher.complete();
      this.pesan.showToast("Gagal Memuat Data Kasbon")
      console.log(err)
    })
    //this.getDataSupplier();
  }

  modalBatal(){
    this.showModalKeuangan = false;
    // this.pelangganUi = 0;
    // this.showModalKaryawan = false;
    // this.karyawanUi = 0;
    // this.titleModalKaryawan = 'Karyawan';
    // this.showNotaModal = false;
    // this.notaPrintHtml = null;
  }

  modalPelangganOk(){
    // this.beliBarangUi = [];
    // this.pesan.showToast("Data keranjang dikosongkan", 'top');
    // this.catatan = "";
    // // console.log(this.pelangganUi, 'change data pelanggan')
    this.keuangan = this.keuanganUi;
    // if(this.keuangan && this.keuangan.kode_nama_keuangan){
    //   this.ambilNoNotaPelanggan(this.pelanggan.kode_pelanggan);
    // }

    this.showModalKeuangan = false;
  }

  cariKeuangan(){
    this.jenisKeuanganUI = this.jenisKeuangan.filter(v => {
      return v.nama_keuangan.toLowerCase().includes(this.textCariKeuangan.toLowerCase()) || v.nomor_keuangan.toLowerCase().includes(this.textCariKeuangan.toLowerCase()) || v.atas_nama.toLowerCase().includes(this.textCariKeuangan.toLowerCase());
    })
  }

  simpan(){
    this.simpanLoading = true;
  //  console.log('keuangan',this.keuangan);
      let dataSimpan = {
        dariAplikasi: true,
        id_penyesuaian : this.kasbonPilih.id_penyesuaian,
        jumlah : this.kasbonPilih.jumlah,
        id_karyawan : this.kasbonPilih.karyawan_id,
        no_voucher : this.noVoucher,
        id_keuangan : this.keuangan && this.keuangan != 0? this.keuangan.kode_nama_keuangan : "",
        id_operator: this.operator.id_karyawan
      }
      //console.log(dataSimpan);

      this.server.pembayaranKasbonKaryawan(dataSimpan).then(data => {

        try{
          data = JSON.parse(data);
        }catch{
          console.log('error parse json - Kasbon');
        }
        console.log(data);
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Kasbon').then(data => {
            this.simpanLoading = false;
            this.hideModelAdd();
            this.getDataKasbon();
          })
        //   this.simpanLoading = false;
        //  // this.afterSimpan();
        //    this.hideModelAdd();
        }else{
          this.pesan.showToast('Pembayaran Kasbon', 'bottom', 'danger');
          this.simpanLoading = false;
        }
      }).catch(err => {
        console.log(err);
        this.simpanLoading = false;
        this.pesan.showToast("Gagal Menambahkan Kasbon", 'bottom', 'danger')
       })


  }

}
