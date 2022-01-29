import { Component, OnDestroy, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ModalService } from '../../../services/modal/modal.service';
import { ServerService }  from '../../../services/server/server.service';
import { StorageService } from '../../../services/storage/storage.service';
import { UserService, User } from '../../../services/user/user.service';
import { ProdukService, Produk } from '../../../services/produk/produk.service';

import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-beranda',
  templateUrl: 'beranda.page.html',
  styleUrls: ['beranda.page.scss']
})
export class BerandaPage implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataUser: User;

  dataProduk: Produk[] = [];
  produkLoading = 0;

  constructor(
    private router: Router,
    private modal: ModalService,
    private server: ServerService,
    private storage: StorageService,
    private user: UserService,
    private produk: ProdukService) {
    user.getDataUser()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataUser = data;
      this.ambilProduk();
    })

    produk.getDataProduk()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataProduk = data;
    })

    if(this.produk.getValueProduk().length < 1){
      this.ambilProduk();
    }
  }

  ambilProduk(){
    this.produkLoading = 1;
    this.server.produk(this.dataUser).then(data => {
      console.log(data)
      if(data.success){
        this.produkLoading = 0;
        this.produk.setDataProduk(data.produk);
      }else{
        this.produkLoading = 2;
      }
    }).catch(err => {
      this.produkLoading = 2;
      console.log(err)
    })
  }

  ionViewDidEnter(){
    this.storage.getDecodedStorage('user:data').then((data: any) => {
      this.user.setDataUser(data);
      this.ambilUser(data._id);
    })
  }

  ambilUser(id){
    this.server.akun(id).then(data => {
      if(data.success){
        this.storage.setStorage('user:data', data.token);
        this.storage.getDecodedStorage('user:data').then((data: any) => {
          this.user.setDataUser(data);
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  tambahKeranjang(i){
    let p = this.dataProduk[i];
    let k = this.produk.getValueKeranjang().find(v => v.produk._id == p._id);
    p['loading'] = true;
    if(k){
      this.server.editKeranjang({idUser: this.dataUser._id, idProduk: p._id, jumlah: k.jumlah + 1}).then(data => {
        console.log(data)
        p['loading'] = false;
        if(data.success){
          this.produk.setDataKeranjang(this.produk.getValueKeranjang().map(v => v.produk._id == k.produk._id? data.keranjang : v));
          this.modal.showToast('Berhasil Menambahkan Produk ke Keranjang', 'medium', 2000, 'bottom', false, true);
        }else{
          this.modal.showToast('Gagal Menambahkan Produk ke Keranjang', 'danger', 2000, 'bottom', false, true);
        }
      }).catch(err => {
        p['loading'] = false;
        this.modal.showToast('Gagal Menambahkan Produk ke Keranjang', 'danger', 2000, 'bottom', false, true);
        console.log(err)
      })
    }else{
      this.server.tambahKeranjang({idUser: this.dataUser._id, idProduk: p._id}).then(data => {
        console.log(data)
        p['loading'] = false;
        if(data.success){
          this.produk.setDataKeranjang([...this.produk.getValueKeranjang(), data.keranjang]);
          this.modal.showToast('Berhasil Menambahkan Produk ke Keranjang', 'medium', 2000, 'bottom', false, true);
        }else{
          this.modal.showToast('Gagal Menambahkan Produk ke Keranjang', 'danger', 2000, 'bottom', false, true);
        }
      }).catch(err => {
        p['loading'] = false;
        this.modal.showToast('Gagal Menambahkan Produk ke Keranjang', 'danger', 2000, 'bottom', false, true);
        console.log(err)        
      })
    }
  }

  get otherServer(){
    return this.server.otherServer;
  }
}
