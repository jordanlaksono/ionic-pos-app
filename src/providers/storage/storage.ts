import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageProvider {

  isLogin = false;

  constructor(public storage: Storage) {}

  public setStorage(key, isi){
    return this.storage.set(key, isi);
  }

  public getStorage(key){
    return this.storage.get(key);;
  }

  public removeStorage(key){
    return this.storage.remove(key);
  }

  public getAllStorage(){
    return this.storage.forEach((v, k) => {
      console.log(k + " : " ,v);
    });
  }

}
