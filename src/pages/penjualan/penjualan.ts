import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';
import { StorageProvider } from '../../providers/storage/storage';
import { PesanProvider } from '../../providers/pesan/pesan';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-penjualan',
  templateUrl: 'penjualan.html'
})
export class PenjualanPage {
  userData;

  noNota;
  bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sept', 'Okt', 'Nov', 'Des']
  tanggal =  new Date().getDate() + " - " + this.bulan[new Date().getMonth()] + " - " + new Date().getFullYear();

  segKeranjang = 'infoNota';
  dataKaryawan = [];
  dataPelanggan = [];
  operator;
  pengambil;
  pengemas;
  pelanggan;

	dataBarang = [];
  dataBarangUi = [];
  dataPotonganPelanggan = [];
  dataPotonganMinPembelian = [];
  dataPotonganMinPembelianCampuran = [];
  dataPotonganPerBarang = [];

  beliBarang = [];
  beliBarangUi = [];
  totalBelanja = 0;

  textCari;

  catatan = "";
  @ViewChild('seg') seg: any;

  hideTotal = false;

  simpanLoading = false;

  showModal = false;

  showModalPelanggan = false;
  dataPelangganUi = [];
  textCariPelanggan;
  pelangganUi = 0;

  showModalKaryawan = false;
  titleModalKaryawan = 'Karyawan'
  dataKaryawanUi = [];
  textCariKaryawan;
  karyawanUi;

  showModalTambahPelanggan = false;
  modalKodePelanggan;
  modalAlamatPelanggan = '';
  modalNamaPelanggan;
  modalKotaPelanggan = '';
  modalTokoPelanggan = '';
  modalNegaraPelanggan = '';
  modalEmailPelanggan = '';
  modalPosPelanggan = '';
  modalNoTlpPelanggan1 = '';
  modalNoTlpPelanggan2 = '';
  modalNoTlpPelanggan3 = '';
  modalCatatanPelanggan = '';
  segModalNoTlp = 'no1';
  dataTop;
  modalTopPelanggan = {
    id_top: 3,
    jumlah: 0,
    nama_top: "TUNAI"
  }
  simpanPelangganLoading = false;

  showNotaModal = false;
  notaPrintHtml;

  constructor(
  	public navCtrl: NavController,
  	private server: ServerProvider,
    private storage: StorageProvider,
    private pesan: PesanProvider,
    private sanitized: DomSanitizer,
  	) {

    // this.ambilDataKaryawan();
    // this.ambilDataPelanggan();
    // this.ambilBarangDariServer();
    // this.ambilPotonganPelanggan();
    // this.ambilPotonganMinPembelian();
    // this.ambilPotonganMinPembelianCampuran();
    // this.ambilPotonganPerBarang();
  }

  ionViewDidLoad(){
    // this.pesan.showToast("Tarik kebawah untuk memuat ulang data produk", 'top', 'normal', 4000)
    this.storage.getStorage("user:data").then(data => {
      this.userData = data;
      // console.log("userdata", this.userData)
      this.operator = this.userData;
      this.ambilDataKaryawan();
    })
    this.ambilDataPelanggan();
    this.ambilBarangDariServer();
    this.ambilPotonganPelanggan();
    this.ambilPotonganMinPembelian();
    this.ambilPotonganMinPembelianCampuran();
    this.ambilPotonganPerBarang();
  }

  ionViewDidEnter(){
    if(this.pelanggan && this.pelanggan.kode_pelanggan){
      this.ambilNoNotaPelanggan(this.pelanggan.kode_pelanggan);
    }else{
      this.ambilNoNotaUmum();
    }
  }

  ambilDataKaryawan(){
    this.server.getDataKaryawan().then(data => {
      this.dataKaryawan = data;
      this.dataKaryawanUi = data;
      let index = data.findIndex(v => v.id_karyawan == this.userData.id_karyawan);
      // this.operator = data[index]
      this.pengambil = data[index]
      this.pengemas = data[index];
      this.karyawanUi = data[index];
      this.ambilNoNotaUmum();
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Karyawan, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err);
    })
  }

  ambilDataPelanggan(){
    this.server.getDataPelanggan().then(data => {
      this.dataPelanggan = data;
      this.dataPelangganUi = data;
      console.log(this.dataPelangganUi);
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Pelanggan, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err);
    })
  }

  ambilBarangDariServer(){
    let l = this.pesan.showLoading('Memuat Data Barang');
    this.server.penjualanGetDataBarang().then(data => {
      l.dismiss();
      if(data.status == 1){
        // console.log(data, 'ambilBarangDariServer')
        this.dataBarang = data.datanya;
        this.dataBarangUi = this.dataBarang;
      }
    }).catch(err => {
      l.dismiss();
      this.pesan.showToast("Gagal Memuat Data Barang, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  ambilPotonganPelanggan(){
    this.server.penjualanGetPotonganPelanggan().then(data => {
      this.dataPotonganPelanggan = data;
      //console.log('data potongan pelanggan: ', data)
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Potongan Pelanggan, Periksa Koneksi Anda.", 'bottom', 'danger');
      console.log(err)
    })
  }

  ambilPotonganMinPembelian(){
    this.server.penjualanGetPotonganMinPembelian().then(data => {
      this.dataPotonganMinPembelian = data.sort(function (a, b) {
        return a.id_varian_harga - b.id_varian_harga || b.qty - a.qty || b.kode_satuan - a.kode_satuan;
      });
      // console.log(data, 'ambilPotonganMinPembelian')
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Potongan Minimum Pembelian, Periksa Koneksi Anda.", 'bottom', 'danger');
      console.log(err);
    });
  }

  ambilPotonganMinPembelianCampuran(){
    this.server.penjualanGetPotonganMinPembelianCampuran().then(data => {
      this.dataPotonganMinPembelianCampuran = data.sort(function (a, b) {
        return a.id_barang - b.id_barang || b.qty - a.qty ;
      });
      // console.log('data potongan min pembelian campuran: ', data)
    }).catch(err => {
      console.log(err);
      this.pesan.showToast("Gagal Memuat Data Potongan Minimum Pembelian, Periksa Koneksi Anda.", 'bottom', 'danger');
    })
  }

  ambilPotonganPerBarang(){
    this.server.penjualanGetPotonganPerBarang().then(data => {
      this.dataPotonganPerBarang = data;
      // console.log(data, 'ambilPotonganPerBarang')
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Data Potongan Pembelian Per Barang, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  ambilNoNotaUmum(){
    this.server.penjualanGetNoNotaUmum().then(data => {
      console.log(data, 'nota umum');
      let dNota = data.maxs? data.maxs.split('/')[1] : 0,
          d = (new Date().getDate() < 10? '0' : '') + new Date().getDate(),
          m = new Date().getMonth() + 1,
          y = new Date().getFullYear().toString().substr(-2),
          urut = d == dNota? data.maxs.split('/')[4] : "000";
      urut++;

      // console.log(urut, 'urut');
      this.noNota = this.operator.kode_karyawan +'/'+d+'/'+m+'/'+y+'-'+'UM'+ this.operator.kode_karyawan.slice(-2) +'/' + this.pad(urut, 3);
    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Nota, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  pad(num, size) {
    var s = "00000" + num;
    return s.substr(s.length-size);
  }

  ambilNoNotaPelanggan(noPelanggan){
    let loading = this.pesan.showLoading('Memuat Nota');
    this.server.penjualanGetNoNotaPelanggan(noPelanggan).then(data => {
      loading.dismiss();
      console.log(new Date().getMonth(), 'nota pelanggan')
      let d = (new Date().getDate() < 10? '0' : '') + new Date().getDate(),
          m = new Date().getMonth() + 1,
          y = new Date().getFullYear().toString().substr(-2),
          urut;

      if(!data.maxs){
        data.maxs = this.operator.kode_karyawan +'/'+d+'/'+m+'/'+y+'-'+noPelanggan+'/'+"00";
      }
      urut = d == data.maxs.split('/')[1]? data.maxs.split('/')[4] : "00";
      urut++;
      this.noNota = this.operator.kode_karyawan +'/'+d+'/'+m+'/'+y+'-'+noPelanggan+'/' + this.pad(urut, 3);

    }).catch(err => {
      this.pesan.showToast("Gagal Memuat Nota, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
  }

  cariPelanggan(){
    this.dataPelangganUi = this.dataPelanggan.filter(v => {
      return v.nama.toLowerCase().includes(this.textCariPelanggan.toLowerCase()) || v.kode_pelanggan.toLowerCase().includes(this.textCariPelanggan.toLowerCase()) || v.no_telp.toLowerCase().includes(this.textCariPelanggan.toLowerCase());
    })
  }

  cariKaryawan(){
    this.dataKaryawanUi = this.dataKaryawan.filter(v => {
      return v.nama.toLowerCase().includes(this.textCariKaryawan.toLowerCase());
    })
  }

  openModalPelangan(){
    this.showModalPelanggan = true;
  }

  modalPelangganOk(){
    this.beliBarangUi = [];
    this.pesan.showToast("Data keranjang dikosongkan", 'top');
    this.catatan = "";
    // console.log(this.pelangganUi, 'change data pelanggan')
    this.pelanggan = this.pelangganUi;
    if(this.pelanggan && this.pelanggan.kode_pelanggan){
      this.ambilNoNotaPelanggan(this.pelanggan.kode_pelanggan);
    }

    this.showModalPelanggan = false;
  }

  modalKaryawanOk(){
    if(this.titleModalKaryawan == 'Pengemas'){
      this.pengemas = this.karyawanUi;
    }

    this.showModalKaryawan = false;
  }

  modalBatal(){
    this.showModalPelanggan = false;
    this.pelangganUi = 0;
    this.showModalKaryawan = false;
    this.karyawanUi = 0;
    this.titleModalKaryawan = 'Karyawan';
    this.showNotaModal = false;
    this.notaPrintHtml = null;
  }

  changePelanggan(){
    this.beliBarangUi = [];
    this.pesan.showToast("Data keranjang dikosongkan");
    // console.log(this.pelanggan, 'change data pelanggan')
    if(this.pelanggan && this.pelanggan.kode_pelanggan){
      this.ambilNoNotaPelanggan(this.pelanggan.kode_pelanggan);
    }
  }

  modalTambahPelanggan(){
    this.showModalPelanggan = false;
    let i = this.pesan.showLoading('Memuat Kode Pelanggan..');

    this.server.penjualanGetKodePelanggan().then(data => {
      this.showModalTambahPelanggan = true;
      i.dismiss();
      if(data.kode){
        this.modalKodePelanggan = data.kode;
        this.dataTop = data.top;
      }else{
        this.pesan.showToast('Gagal Memuat Kode Pelanggan, Coba Lagi..')
      }
    }).catch(err => {
      this.pesan.showToast('Gagal Memuat Kode Pelanggan, Coba Lagi..')
      i.dismiss();
      this.showModalTambahPelanggan = true;
    })
  }

  tambahPelanggan(){
    if(!this.modalNamaPelanggan) return this.pesan.showAlert("", "Masukkan Nama Pelanggan");
    this.simpanPelangganLoading = true
    let dataKirim = {
      dariAplikasi: true,
      kode: this.modalKodePelanggan,
      nama: this.modalNamaPelanggan,
      nama_toko: this.modalTokoPelanggan,
      email: this.modalEmailPelanggan,
      no_telp: this.modalNoTlpPelanggan1,
      no_telp2: this.modalNoTlpPelanggan2,
      no_telp3: this.modalNoTlpPelanggan3,
      id_top: this.modalTopPelanggan.id_top,
      alamat: this.modalAlamatPelanggan,
      kota: this.modalKotaPelanggan,
      negara: this.modalNegaraPelanggan,
      kode_pos: this.modalPosPelanggan,
      catatan: this.modalCatatanPelanggan,
      add: true
    }

    this.server.penjualanTambahPelanggan(dataKirim).then(data => {
      console.log(data);
      data = JSON.parse(data);
      this.simpanPelangganLoading = false;
      if(data.success){
        this.ambilDataPelanggan();
        this.pesan.showAlert("", "Berhasil Menambahkan Pelanggan").then(data => {
          this.showModalPelanggan = true;
          this.showModalTambahPelanggan = false;
        })
        this.modalKodePelanggan = null;
        this.modalAlamatPelanggan = '';
        this.modalNamaPelanggan =  null;
        this.modalKotaPelanggan = '';
        this.modalTokoPelanggan = '';
        this.modalNegaraPelanggan = '';
        this.modalEmailPelanggan = '';
        this.modalPosPelanggan = '';
        this.modalNoTlpPelanggan1 = '';
        this.modalNoTlpPelanggan2 = '';
        this.modalNoTlpPelanggan3 = '';
        this.modalCatatanPelanggan = '';
      }else{
        this.pesan.showAlert("", "Gagal Menambahkan Pelanggan");
      }
    }).catch(err => {
      this.simpanPelangganLoading = false;
      this.pesan.showAlert("", "Gagal Menambahkan Pelanggan");
      console.log(err);
    })
  }

  inputPress(e){
    if((e.key == "Enter" || e.keyCode == 13) && this.textCari){
      if(this.dataBarangUi.length == 1){
        this.tambahBeli(0);
      }
      e.target.select();
    }
  }
  cariOnInput(e){
    this.dataBarangUi = this.dataBarang.filter(v => {
      return v.kode_barcode_varian.toLowerCase().includes(this.textCari.toLowerCase()) || v.nama_barang.toLowerCase().includes(this.textCari.toLowerCase());
    })
  }
  cariOnCancel(){}

  refresh(refresher){
    this.server.penjualanGetDataBarang().then(data => {
      refresher.complete();
      if(data.status == 1){
        console.log(data, 'ambilBarangDariServer')
        this.dataBarang = data.datanya;
        this.dataBarangUi = this.dataBarang;
      }
    }).catch(err => {
      refresher.complete();
      this.pesan.showToast("Gagal Memuat Data Barang, Periksa Koneksi Anda.", 'bottom', 'danger')
      console.log(err)
    })
    this.ambilPotonganPelanggan();
    this.ambilPotonganMinPembelian();
    this.ambilPotonganMinPembelianCampuran();
    this.ambilPotonganPerBarang();
    this.ambilDataPelanggan();
    this.ambilDataKaryawan();
  }

  tambahBeli(i){
    // console.log(this.dataBarangUi[i].stok_gudang);
    if(this.dataBarangUi[i].stok_gudang < 1) return;
    this.segKeranjang = 'barang';
    let cekPotonganPelanggan = this.dataPotonganPelanggan.filter(v => {
      if(this.pelanggan && this.pelanggan.hasOwnProperty("kode_pelanggan")){
        return v.kode_pelanggan == this.pelanggan.kode_pelanggan && v.id_varian_harga == this.dataBarangUi[i].id_varian_harga
      }else{
        return false;
      }
    });
    let cekPotonganPerBarang = this.dataPotonganPerBarang.filter(v => {
      return v.id_varian_harga == this.dataBarangUi[i].id_varian_harga && v.diskon_rupiah > 0;
    })

    console.log(' this.dataBarangUi[i]',  this.dataBarangUi[i]);

    let barang = {
      id_varian_harga: this.dataBarangUi[i].id_varian_harga,
      nama_barang: this.dataBarangUi[i].nama_barang,
      warna: this.dataBarangUi[i].warna,
      satuan: this.dataBarangUi[i].satuan,
      stok: this.dataBarangUi[i].stok_gudang,
      jumlah: 1,
      id_sub_kelompok:  this.dataBarangUi[i].id_sub_kelompok,
      id_barang: this.dataBarangUi[i].id_barang,
      id_barangne: this.dataBarangUi[i].id_barang,
      presentase_bonus: this.dataBarangUi[i].presentase_bonus
    }

    let kelompokBarang = {
      id_barang: this.dataBarangUi[i].id_barang,
      harga:      cekPotonganPelanggan.length > 0? cekPotonganPelanggan[0].harga_diskon :
                  cekPotonganPerBarang.length > 0? this.dataBarangUi[i].harga - cekPotonganPerBarang[0].diskon_rupiah :
                  this.dataBarangUi[i].harga,
      harga_asli: this.dataBarangUi[i].harga,
      sub_total:  cekPotonganPelanggan.length > 0? cekPotonganPelanggan[0].harga_diskon :
                  cekPotonganPerBarang.length > 0? this.dataBarangUi[i].harga - cekPotonganPerBarang[0].diskon_rupiah :
                  this.dataBarangUi[i].harga,
      kode_satuan: this.dataBarangUi[i].kode_satuan,
      potPel: cekPotonganPelanggan.length > 0? true : false,
      potPer: cekPotonganPerBarang.length > 0? true : false,
      barang: [barang]
    }

    // cek id-barang, harga, id-satuan sama
    let ik = -1;
    this.beliBarangUi.forEach((v, ii) => {
      if( v.id_barang == kelompokBarang.id_barang &&
          v.harga_asli == kelompokBarang.harga_asli &&
          v.kode_satuan == kelompokBarang.kode_satuan &&
          v.potPel == kelompokBarang.potPel
       ){
        ik = ii;
      }
    })

    if(ik < 0){
      this.beliBarangUi.push(kelompokBarang);
      this.hitungTotal();
    }else{
      let ind = this.beliBarangUi[ik].barang.map(v => {
        return Number(v.id_varian_harga)
      }).indexOf(Number(this.dataBarangUi[i].id_varian_harga))

      if(ind < 0){
        this.beliBarangUi[ik].barang.push(barang);
      }else{
        this.beliBarangUi[ik].barang[ind]['jumlah'] += 1;
      }

      this.hitungSubTotal(ik, barang);
    }
  }

  changeJumlah(ik, bbb){
    if(Number(bbb.jumlah) > Number(bbb.stok)){
      // pesan max pembelian seeuai stok
      bbb.jumlah = bbb.stok;
    }else if(Number(bbb.jumlah) == 0 ){
      bbb.jumlah = 1;
    }
    this.hitungSubTotal(ik, bbb);
  }

  tambahJumlah(ik, bbb){
    // cek stok first
    if(bbb.jumlah > bbb.stok) return;
    bbb.jumlah += 1;
    this.hitungSubTotal(ik, bbb);
  }

  kurangJumlah(ik, bbb){
    if(bbb.jumlah <= 1) return;
    bbb.jumlah -= 1;
    this.hitungSubTotal(ik, bbb);
  }
  hapusBarang(ik, i){
    if(this.beliBarangUi[ik].barang.length == 1){
      this.beliBarangUi.splice(ik, 1);
      this.hitungTotal();
    }else{
      this.beliBarangUi[ik].barang.splice(i, 1);
      this.hitungSubTotal(ik, this.beliBarangUi[ik].barang[0]);
    }
  }

  hitungSubTotal(ik, bbb){
    let jumlah = this.beliBarangUi[ik].barang
      .map(v => { return v.jumlah })
      .reduce((a, c) => { return Number(a) + Number(c) }, 0);

    let cekPotonganMinPembelian = this.dataPotonganMinPembelian.filter(v => {
      return v.id_varian_harga == bbb.id_varian_harga && Number(v.qty) <= Number(jumlah) && this.beliBarangUi[ik].barang.length < 2;
    })
    let cekPotonganMinPembelianCampuran = this.dataPotonganMinPembelianCampuran.filter(v => {
      return v.id_barang == this.beliBarangUi[ik].id_barang && Number(v.qty) <= Number(jumlah) && v.kode_satuan == this.beliBarangUi[ik].kode_satuan && this.beliBarangUi[ik].barang.length > 1;
    })

    let harga = this.beliBarangUi[ik].potPel? this.beliBarangUi[ik].harga :
      cekPotonganMinPembelianCampuran.length > 0 && !this.beliBarangUi[ik].potPel? cekPotonganMinPembelianCampuran[0].harga_jual_campuran :
      cekPotonganMinPembelian.length > 0 && !this.beliBarangUi[ik].potPel && !this.beliBarangUi[ik].potMinC? cekPotonganMinPembelian[0].harga_jual :
      this.beliBarangUi[ik].harga_asli;

     // console.log('harga', harga);

    this.beliBarangUi[ik]['potMinC'] = cekPotonganMinPembelianCampuran.length > 0 && !this.beliBarangUi[ik].potPel? true : false;
    this.beliBarangUi[ik]['potMin'] = cekPotonganMinPembelian.length > 0 && !this.beliBarangUi[ik].potPel && !this.beliBarangUi[ik]['potMinC']? true : false;

    this.beliBarangUi[ik].sub_total = jumlah * harga;
    this.beliBarangUi[ik].harga = harga;

    this.hitungTotal();
  }

  hitungTotal(){
    this.totalBelanja = this.beliBarangUi
    .map(v => { return v.sub_total })
    .reduce((a, c) => { return Number(a) + Number(c) }, 0);
  }

  aa: any;
  catFocus(scroll, e){
    this.hideTotal = true;
    clearTimeout(this.aa);
    if(scroll){
      setTimeout(() => {
        this.seg.nativeElement.scroll({
          top: this.seg.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 300)
    }else{
      setTimeout(() => {
        this.seg.nativeElement.scroll({
          top: this.seg.nativeElement.scrollTop + e._elementRef.nativeElement.getBoundingClientRect().top - 42 - 56 - 24,
          behavior: 'smooth'
        });
      }, 300)
    }
  }

  catBlur(){
    this.aa = setTimeout(() => {
      this.hideTotal = false;
    }, 500)
  }

  simpan(){
    if(!this.operator || !this.pengambil || !this.pengemas){
      return this.pesan.showAlert("Operator Kosong","Mohon Pilih Operator");
    }
    this.simpanLoading = true;
    let dataSimpan = {
      dariAplikasi: true,
      no_nota: this.noNota,
      operator: this.operator.id_karyawan,
      pengemas_barang: this.pengemas.id_karyawan,
      pengambil_barang: this.pengambil.id_karyawan,
      waktu: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }),
      tanggal: new Date().toJSON().slice(0,10).replace(/-/g,'-'),
      id_pelanggan: this.pelanggan && this.pelanggan != 0? this.pelanggan.kode_pelanggan : "",
      catatan: this.catatan,
      jumlah_beli: [],
      id_varian_harga: [],
      id_barang: [],
      id_sub_kelompok: [],
      id_kelompok: [],
      id_barangne: [],
      harga_jual: [],
      harga_satuan: [],
      kode_satuan: [],
      sub_total: [],
      presentase_bonus: [],
      Total: this.totalBelanja
    }

    this.beliBarangUi.forEach((v, i) => {
      v.barang.forEach((vv, i) => {
        dataSimpan['jumlah_beli'].push(vv.jumlah);
        dataSimpan['id_varian_harga'].push(vv.id_varian_harga);
        dataSimpan['id_kelompok'].push(vv.id_kelompok);
        dataSimpan['id_sub_kelompok'].push(vv.id_sub_kelompok);
        dataSimpan['id_barangne'].push(vv.id_barangne);
        dataSimpan['harga_jual'].push(v.harga);
        dataSimpan['presentase_bonus'].push(vv.presentase_bonus);
      })

      dataSimpan['id_barang'].push(v.id_barang);
      dataSimpan['harga_satuan'].push(v.harga);
      dataSimpan['kode_satuan'].push(v.kode_satuan);
      dataSimpan['sub_total'].push(v.sub_total);
    })

    console.log(dataSimpan, dataSimpan['id_pelanggan']);
    this.server.penjualanSimpan(dataSimpan).then(data => {
      data = data.replace(data.substr(0, data.search('{"success"')), '')
      data = JSON.parse(data);
      console.log(data);
      this.simpanLoading = false;
      if(data.success){
        this.showNotaModal = true;
        this.notaPrintHtml = this.sanitized.bypassSecurityTrustHtml(data['nota']);
        this.showModal = false;
        this.beliBarangUi = [];
        this.pelanggan = 0;
        this.ambilNoNotaUmum();
        this.segKeranjang = 'infoNota';
        this.pelangganUi = 0;

        // this.pesan.showAlert("Berhasil","Berhasil Menambahkan Nota.").then(data => {
        // });
      }else{
        this.pesan.showToast("Gagal Menambahkan Nota", 'bottom', 'danger')
      }
    }).catch(err => {
      console.log(err);
      this.simpanLoading = false;
      this.pesan.showToast("Gagal Menambahkan Nota", 'bottom', 'danger')
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
