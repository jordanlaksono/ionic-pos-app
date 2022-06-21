import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';
import { PesanProvider } from '../../providers/pesan/pesan';

/**
 * Generated class for the ProdukDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-produk-detail',
  templateUrl: 'produk-detail.html',
})
export class ProdukDetailPage {

  segmentDetailBarang = 'informasi';
  textCari;
  barang;
  varian;
  varianUi;
  campuran;

  showDetail = false;
  dataDetailVarianQty = [];
  dataDetailVarianPelanggan = [];

  segmentModal = 'qty';

  constructor(
    public navCtrl: NavController, 
  	public navParams: NavParams,
  	private server: ServerProvider,
    private pesan: PesanProvider
  ) {
    	this.barang = navParams.get('barang');
  }

  ionViewDidLoad() {
    this.ambilDetailbarang();
  }

  ambilDetailbarang(){
    let l = this.pesan.showLoading("Memuat Data Detail Barang")
  	this.server.barangGetDetailBarang(this.barang.id_barang).then(data => {
      l.dismiss();
      this.varian = data.varian;
  		this.varianUi = data.varian;
  		this.campuran = data.campuran;
  		console.log(data)
  	}).catch(err => {
      l.dismiss();
      this.pesan.showToast('Gagal Memuat Data Detail Barang');
  		console.log(err);
  	})
  }

  inputPress(e){
    if((e.key == "Enter" || e.keyCode == 13) && this.textCari){
      if(this.varianUi.length == 1){
        // this.bpbPilih = this.bpbUi[0]
      }
      e.target.select();
    }
  }
  cariOnInput(){
    this.varianUi = this.varian.filter(v => {
      return v.kode_barcode_varian.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.hitungan.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.warna.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.harga.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.satuan.toLowerCase().includes(this.textCari.toLowerCase())
    })
  }
  cariOnCancel(){}

  refresh(refresher){
    this.server.barangGetDetailBarang(this.barang.id_barang).then(data => {
      refresher.complete();
      this.varian = data.varian;
      this.varianUi = data.varian;
      this.campuran = data.campuran;
      // console.log(data)
    }).catch(err => {
      refresher.complete();
      console.log(err);
    })
  }

  detailVarian(v){
    let l = this.pesan.showLoading("Memuat Data " + this.barang.kode_barang + " - " + v.warna);
    this.server.barangGetDetailVarian(v.id_varian_harga).then(data => {
      l.dismiss();
      this.showDetail = true;
      this.dataDetailVarianQty = data.qty;
      this.dataDetailVarianPelanggan = data.pelanggan;
      console.log(data)
    }).catch(err => {
      l.dismiss();
      console.log(err)
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
