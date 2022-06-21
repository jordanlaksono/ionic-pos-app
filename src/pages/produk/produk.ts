import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ProdukDetailPage } from '../produk-detail/produk-detail';

import { ServerProvider } from '../../providers/server/server';
import { PesanProvider } from '../../providers/pesan/pesan';

@Component({
  selector: 'page-produk',
  templateUrl: 'produk.html'
})
export class ProdukPage {
  textCari;
  dataBarang;
	dataBarangUi = [];
	dataKelompok = [];
	dataSubKelompok = [];

  constructor(
  	public navCtrl: NavController,
  	private server: ServerProvider,
    private pesan: PesanProvider) {
  }

  ionViewDidLoad(){
    // this.pesan.showToast("Tarik kebawah untuk memuat ulang data produk", 'top', 'normal', 4000)
    this.getDataBarang();
  }

  getDataBarang(){
    let l = this.pesan.showLoading('Memuat Data Barang');
  	this.server.barangGetDataBarang().then(data => {
      l.dismiss();
      console.log(data)
  		this.dataKelompok = data.kelompok;
  		this.dataSubKelompok = data.sub_kelompok;

  		this.dataBarang = data.barang.map(v => {
        let nama_kelompok = this.dataKelompok.find(vv => vv.id_kelompok == v.id_kelompok)
        if(nama_kelompok){
  			  v.nama_kelompok = nama_kelompok.nama_kelompok
        }
        let nama_subkelompok = this.dataSubKelompok.find(vv => vv.id_sub_kelompok == v.id_sub_kelompok);
        if(nama_subkelompok){
  			  v.nama_subkelompok = nama_subkelompok.nama_sub_kelompok;
        }
  			return v;
  		});
      if(this.textCari) return;
      this.dataBarangUi = this.dataBarang;
      console.log(this.dataBarang);
  	}).catch(err => {
      l.dismiss();
      this.pesan.showToast('Gagal Memuat Data Barang');
  		console.log(err);
  	})
  }

  inputPress(e){
    if((e.key == "Enter" || e.keyCode == 13) && this.textCari){
      if(this.dataBarangUi.length == 1){
        // this.bpbPilih = this.bpbUi[0]
      }
      e.target.select();
    }
  }
  cariOnInput(){
    if(!this.textCari || this.textCari == '') return this.dataBarangUi = this.dataBarang;
    this.dataBarangUi = this.dataBarang.filter(v => {
      return v.kode_barang.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.nama_barang.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.ket.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.nama_kelompok.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.nama_subkelompok.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.varian.some(c => c.kode_barcode_varian.toString() == this.textCari.toString())
    })
  }
  cariOnCancel(){
    this.dataBarangUi = this.dataBarang;
  }

  refresh(refresher){
    this.server.barangGetDataBarang().then(data => {
      refresher.complete();
      console.log(data)
      this.dataKelompok = data.kelompok;
      this.dataSubKelompok = data.sub_kelompok;

      this.dataBarang = data.barang.map(v => {
        let nama_kelompok = this.dataKelompok.find(vv => vv.id_kelompok == v.id_kelompok)
        if(nama_kelompok){
          v.nama_kelompok = nama_kelompok.nama_kelompok
        }
        let nama_subkelompok = this.dataSubKelompok.find(vv => vv.id_sub_kelompok == v.id_sub_kelompok);
        if(nama_subkelompok){
          v.nama_subkelompok = nama_subkelompok.nama_sub_kelompok;
        }
        return v;
      });
      if(this.textCari) return;
      this.dataBarangUi = this.dataBarang;
      console.log(this.dataBarang);
    }).catch(err => {
      refresher.complete();
      this.pesan.showToast('Gagal Memuat Data Barang');
      console.log(err);
    })
  }

  detailBarang(i){
  	this.navCtrl.push(ProdukDetailPage, {
  		barang: this.dataBarangUi[i]
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

}
