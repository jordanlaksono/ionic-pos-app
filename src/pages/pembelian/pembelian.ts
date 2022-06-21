import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera'
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

import { ServerProvider } from '../../providers/server/server';
import { PesanProvider } from '../../providers/pesan/pesan';

@Component({
  selector: 'page-pembelian',
  templateUrl: 'pembelian.html'
})
export class PembelianPage {
	textCari;
	bpb;
	bpbUi;
  supplierUi = [];

  noEksp;
  openModalAdd;
  openModalUpdate;
  modalTitle;
  bpbPilih = {
    kode_bpb: '',
    no_ekspedisi: '',
    nama: '',
    coly: '',
    kode_supplier: '',
    metode_pengiriman: '',
    nama_ekspedisi: '',
    biaya_ekspedisi: '',
    image: '',
  };

  simpanLoading = false;

  selectedFiles : File;
  selectedFilesNative;
  selectedFilesUi;
  selectedFilesNativeUi;

  serverUrl = this.server.serverUrl;
  serverUrlImg = this.serverUrl + 'assets/images/';

  baru_no_ekspedisi = '';
  baru_nama: any = 0;
  baru_coly = '';
  baru_metode_pengiriman = 'ekspedisi';
  baru_nama_ekspedisi = '';
  baru_biaya_ekspedisi = '';
  baru_image = '';

  constructor(
  	public navCtrl: NavController,
  	private server: ServerProvider,
    private camera: Camera,
    private alertCtrl: AlertController,
    private pesan: PesanProvider,
    private file: File,
    private filePath: FilePath
    ) {
  }

  ionViewDidLoad(){
    this.pesan.showToast("Tarik kebawah untuk memuat ulang data Bpb", 'top', 'normal', 4000)
    this.getDataBpb();
    this.getDataSupplier();
  }

  getDataBpb(){
    let l = this.pesan.showLoading('Memuat Data Bpb');
    this.server.bpbGetDataBpb().then(data => {
      l.dismiss();
      this.bpb = data;
      this.bpbUi = this.bpb.sort((a,b) => (a.tanggal == b.tanggal)? ((a.waktu > b.waktu)? -1 : (a.waktu > b.waktu)? 1 : 0) : (a.tanggal > b.tanggal) ? -1 : ((b.tanggal > a.tanggal) ? 1 : 0));
      console.log(data)
    }).catch(err => {
      l.dismiss();
      this.pesan.showToast("Gagal Memuat Data Pembelian")
      console.log(err)
    })
  }

  getDataSupplier(){
    // let l = this.pesan.showLoading('Memuat Data Supplier');
    this.server.bpbGetSupplier().then(data => {
      // l.dismiss();
      this.supplierUi = data;
      console.log(data, 'supplier')
    }).catch(err => {
      // l.dismiss();
      this.pesan.showToast("Gagal Memuat Data Supplier")
      console.log(err)
    })
  }

  inputPress(e){
    if((e.key == "Enter" || e.keyCode == 13) && this.textCari){
      if(this.bpbUi.length == 1){
        // this.bpbPilih = this.bpbUi[0]
      }
      e.target.select();
    }
  }
  cariOnInput(e){
    this.bpbUi = this.bpb.filter(v => {
      return v.notrans.toLowerCase().includes(this.textCari.toLowerCase()) ||
      v.nama.toLowerCase().includes(this.textCari.toLowerCase())
    })
    console.log(this.bpbUi)
  }
  cariOnCancel(){}

  refresh(refresher){
    this.server.bpbGetDataBpb().then(data => {
      refresher.complete();
      this.bpb = data;
      this.bpbUi = this.bpb.sort((a,b) => (a.tanggal == b.tanggal)? ((a.waktu > b.waktu)? -1 : (a.waktu > b.waktu)? 1 : 0) : (a.tanggal > b.tanggal) ? -1 : ((b.tanggal > a.tanggal) ? 1 : 0));
      console.log(data)
    }).catch(err => {
      refresher.complete();
      this.pesan.showToast("Gagal Memuat Data Pembelian")
      console.log(err)
    })
    this.getDataSupplier();
  }

  tambahBpb(){
    this.openModalAdd = true;
  }

  editBpb(b){
    this.openModalUpdate = true;
    this.bpbPilih = b;
    this.selectedFiles = null;
    this.selectedFilesNative = null;
    this.selectedFilesUi = null;
    this.selectedFilesNativeUi = null;
  }

  ambilPhoto(){
    let alert = this.alertCtrl.create({
      title: "Ambil Photo",
      cssClass: 'ambil-photo',
      buttons: [
      {
        text: 'Ambil Photo Dari Kamera',
        handler: () => {
          this.pilihGambar(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Pilih Photo Dari Galeri',
        handler: () => {
          this.pilihGambar(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      }
      ]
    });
    alert.present();
  }

  pilihGambar(sourceType){
    let cameraOptions = {
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.FILE_URI,      
      // destinationType: this.camera.DestinationType.DATA_URL,      
      encodingType: this.camera.EncodingType.JPEG,      
      quality: 30,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      // allowEdit: true,
    }

    this.camera.getPicture(cameraOptions).then(img => {
      this.selectedFilesNative = img;
      
      this.filePath.resolveNativePath(img).then(filePath => {
        this.selectedFilesNativeUi = filePath;
      }).catch(err => console.log(err));
    }, err => {
      console.log("camera error " + err);
      this.pesan.showToast("Device Tidak Mendukung");
    })
  }

  selectFile(event) {
    var files = event.target.files;
    var file = files[0];
    this.selectedFiles = file;

    if (files && file) {
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }

    // this.selectedFilesUi = event.target.files;
    // this.bpbPilih['image'] = new FileReader().readAsDataURL(this.selectedFiles.item(0));
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.selectedFilesUi = "data:image/jpeg;base64," + btoa(binaryString);
  }

  hapusGambar(){

  }

  simpan(){
    this.simpanLoading = true;
    
    let dataKirim = {
      dariAplikasi: true,
      kode_bpb: this.bpbPilih.kode_bpb,
      no_ekspedisi: this.bpbPilih.no_ekspedisi,
      kode_supplier: this.bpbPilih.kode_supplier,
      coly: this.bpbPilih.coly,
      metode_pengiriman: this.bpbPilih.metode_pengiriman,
      nama_ekspedisi: this.bpbPilih.nama_ekspedisi,
      biaya_ekspedisi: this.bpbPilih.biaya_ekspedisi,
      add: "",
      // 'file-upload': this.selectedFiles
    }
    console.log(this.selectedFilesNative)

    if(this.selectedFilesNative){
      this.server.nativeUploadFile(this.selectedFilesNative, 'Bpb_master/ajax_update', dataKirim).then(data => {
        console.log(data, 'hasil upload - PembelianPage');
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Edit Pembelian').then(data => {
            this.simpanLoading = false;
            this.hideModelUpdate();
            this.getDataBpb();
          })
        }else{
          this.simpanLoading = false;
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataBpb();
        console.log(err, 'err upload - PembelianPage');
      })
    }else{
      this.server.bpbUpdateData(dataKirim).then(data => {
        console.log(data, 'hasil update tanpa upload - PembelianPage');
        data = JSON.parse(data);
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Edit Pembelian').then(data => {
            this.simpanLoading = false;
            this.hideModelUpdate();
            this.getDataBpb();
          })
        }else{
          this.simpanLoading = false;
          this.pesan.showToast("Gagal Edit Pembelian")
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataBpb();
        console.log(err, 'err upload - PembelianPage');
      })
    }

    // if(this.selectedFilesNative){
    // }else{
    //   console.log(this.selectedFiles)
    //   this.server.uploadFile( "Bpb_master/ajax_update", dataKirim).then(data => {
    //     console.log(data);
    //     data = JSON.parse(data);
    //     if(data.success){
    //       this.pesan.showAlert('Berhasil', 'Berhasil Edit Pembelian').then(data => {
    //         this.simpanLoading = false;
    //         this.hideModelUpdate();
    //         this.getDataBpb();
    //       })
    //     }else{
    //       this.simpanLoading = false;
    //     }
    //   }).catch(err => {
    //     this.simpanLoading = false;
    //     this.getDataBpb();
    //     console.log(err);
    //   })
    // }
    

    // this.server.bpbUpdateData(dataKirim).then(data => {
    //   this.simpanLoading = false;
    //   data = JSON.parse(data);
    //   console.log(data);
    //   this.openModalUpdate = false; 
    //   this.bpbPilih = null;
    // }).catch(err => {
    //   this.simpanLoading = false;
    //   console.log(err);
    // })
  }

  hideModelUpdate(){
    this.openModalUpdate = false;
    this.bpbPilih = {
      kode_bpb: '',
      no_ekspedisi: '',
      nama: '',
      coly: '',
      kode_supplier: '',
      metode_pengiriman: '',
      nama_ekspedisi: '',
      biaya_ekspedisi: '',
      image: '',
    };
    this.selectedFiles = null;
    this.selectedFilesNative = null;
    this.selectedFilesUi = null;
    this.selectedFilesNativeUi = null;
  }


  tambah(){
    if(this.baru_nama == 0){
      return this.pesan.showToast("Nama Supplier Belum Diisi");
    }
    this.simpanLoading = true;
    let dataKirim = {
      dariAplikasi: true,
      no_ekspedisi: this.baru_no_ekspedisi,
      kode_supplier: this.baru_nama.kode_supplier,
      coly: this.baru_coly,
      metode_pengiriman: this.baru_metode_pengiriman,
      nama_ekspedisi: this.baru_nama_ekspedisi,
      biaya_ekspedisi: this.baru_biaya_ekspedisi,
      add: "",
      'file-upload': this.selectedFiles
    }

    if(this.selectedFilesNative){
      this.server.nativeUploadFile(this.selectedFilesNative, 'Bpb_master/ajax_add', dataKirim).then(data => {
        console.log(data, 'hasil upload - PembelianPage');
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Pembelian').then(data => {
            this.simpanLoading = false;
            this.hideModelAdd();
            this.getDataBpb();
          })
        }else{
          this.simpanLoading = false;
          this.pesan.showToast("Gagal Menambahkan Pembelian")
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataBpb();
        this.pesan.showToast("Gagal Menambahkan Pembelian")
        console.log(err, 'err upload - PembelianPage');
      })
    }else{
      this.server.bpbAddData(dataKirim).then(data => {
        console.log(data, 'hasil update tanpa upload - PembelianPage');
        data = JSON.parse(data);
        if(data.success){
          this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Pembelian').then(data => {
            this.simpanLoading = false;
            this.hideModelAdd();
            this.getDataBpb();
          })
        }else{
          this.simpanLoading = false;
          this.pesan.showToast("Gagal Edit Pembelian")
        }
      }).catch(err => {
        this.simpanLoading = false;
        this.getDataBpb();
        this.pesan.showToast("Gagal Menambahkan Pembelian")
        console.log(err, 'err upload - PembelianPage');
      }) 
    }

    // this.server.uploadFile("Bpb_master/ajax_add", dataKirim).then(data => {
    //   console.log(data);
    //   data = JSON.parse(data);
    //   this.simpanLoading = true;

    //   if(data.success){
    //     this.pesan.showAlert('Berhasil', 'Berhasil Menambahkan Pembelian').then(data => {
    //       this.simpanLoading = false;
    //       this.getDataBpb();
    //       this.hideModelAdd();
    //     })
    //   }else{
    //     this.simpanLoading = false;
    //     this.pesan.showToast("Gagal Menambahkan Pembelian")
    //   }
    // }).catch(err => {
    //   this.simpanLoading = false;
    //   this.getDataBpb();
    //   console.log(err);
    //   this.pesan.showToast("Gagal Menambahkan Pembelian")
    // })
  }

  hideModelAdd(){
    this.openModalAdd = false;
    this.baru_no_ekspedisi = '';
    this.baru_nama = 0;
    this.baru_coly = '';
    this.baru_metode_pengiriman = 'ekspedisi';
    this.baru_nama_ekspedisi = '';
    this.baru_biaya_ekspedisi = '';
    this.selectedFiles = null;
    this.selectedFilesNative = null;
    this.selectedFilesUi = null;
    this.selectedFilesNativeUi = null;
    
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
