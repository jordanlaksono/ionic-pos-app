import { NgModule, ErrorHandler, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Keyboard } from '@ionic-native/keyboard';

import { PenjualanPage } from '../pages/penjualan/penjualan';
import { PembelianPage } from '../pages/pembelian/pembelian';
import { PembayaranPage } from '../pages/pembayaran/pembayaran';
import { ProdukPage } from '../pages/produk/produk';
import { ProdukDetailPage } from '../pages/produk-detail/produk-detail';
import { ReturnPage } from '../pages/return/return';
import { NotaPage } from '../pages/nota/nota';
import { TransaksiPage } from '../pages/transaksi/transaksi';
import { KasbonPage } from '../pages/kasbon/kasbon';
import { PiutangPage } from '../pages/piutang/piutang';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HTTP } from '@ionic-native/http';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { Printer } from '@ionic-native/printer';

import { ServerProvider } from '../providers/server/server';
import { StorageProvider } from '../providers/storage/storage';
import { PesanProvider } from '../providers/pesan/pesan';

import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
registerLocaleData(localeId);

import { NgxBarcodeModule } from 'ngx-barcode';
import { CurrencyMaskModule } from "ng2-currency-mask";

import { Camera } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

@NgModule({
  declarations: [
    MyApp,
    PembelianPage,
    PembayaranPage,
    PenjualanPage,
    ProdukPage,
    ProdukDetailPage,
    ReturnPage,
    NotaPage,
    TransaksiPage,
    LoginPage,
    KasbonPage,
    PiutangPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, { scrollAssist: false }),
    HttpClientModule,
    NgxBarcodeModule,
    IonicStorageModule.forRoot(),
    CurrencyMaskModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    PembelianPage,
    PembayaranPage,
    PenjualanPage,
    ProdukPage,
    ProdukDetailPage,
    ReturnPage,
    NotaPage,
    TransaksiPage,
    LoginPage,
    KasbonPage,
    PiutangPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Keyboard,
    HTTP,
    Printer,
    ServerProvider,
    StorageProvider,
    PesanProvider,
    { provide: LOCALE_ID, useValue: 'id-ID'},
    Camera,
    FileTransfer,
    File,
    FilePath
  ]
})
export class AppModule {}
