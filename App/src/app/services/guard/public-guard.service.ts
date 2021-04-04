import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { StorageService } from '../storage/storage.service';
import { ProdukService } from '../produk/produk.service';
import { PembelianService } from '../pembelian/pembelian.service';

@Injectable({
  providedIn: 'root'
})
export class PublicGuardService implements CanActivate {

  constructor(
  	private router: Router,
  	private storage: StorageService,
    private produk: ProdukService,
    private pembelian: PembelianService) { }

  canActivate(): Promise<boolean | UrlTree> {
    return this.storage.getDecodedStorage('user:data').then(data => {
      if(data && data['_id'] && !data['isAdmin'] && data['status'] == 2){
        return true;
      }else if(data && data['_id'] && !data['isAdmin'] && data['status'] == 1){
        return this.router.parseUrl('/kurir');
      }else if(data && data['_id'] && data['isAdmin']){
        return this.router.parseUrl('/admin');
      }else{
        return this.router.parseUrl('/masuk');
        this.produk.setDataProduk([]);
        this.pembelian.setDataAll([]);
      }
    }).catch(err => {
      console.log(err, 'err getStorage - canActivate - AuthGuardService');
      return this.router.parseUrl('/masuk');
      this.produk.setDataProduk([]);
      this.pembelian.setDataAll([]);
    })
  }
}
