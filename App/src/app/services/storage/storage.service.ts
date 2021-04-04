import { Injectable } from '@angular/core';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  setStorage(key, data){
  	return Storage.set({ key: key, value: JSON.stringify(data) });
  }

  getStorage(key){
  	return Storage.get({ key: key }).then(data => { return JSON.parse(data.value) });
  }

  getDecodedStorage(key){
    return Storage.get({ key: key }).then(data => { 
      try{
        return jwt_decode(JSON.parse(data.value)); 
      }catch(err){
        return null
      }
    });
  }

  removeStorage(key){
  	return Storage.remove({ key: key });
  }

  decodeJwt(data){
    try{
      return jwt_decode(data);
    }catch(err){
      return null
    }
  }
}
