import { Component, OnDestroy, ViewChildren, ElementRef, QueryList, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../services/server/server.service';
import { StorageService } from '../../../services/storage/storage.service';
import { ModalService } from '../../../services/modal/modal.service';
import { UserService, User } from '../../../services/user/user.service';
import { ProdukService, Keranjang } from '../../../services/produk/produk.service';
import { PembelianService } from '../../../services/pembelian/pembelian.service';

import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-keranjang',
  templateUrl: './keranjang.page.html',
  styleUrls: ['./keranjang.page.scss'],
})
export class KeranjangPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();
  dataUser: User;
	dataKeranjang: Keranjang[] = [];
  keranjangLoading = 0;

  totalBayar = 0;

  @ViewChildren('keranjangList', { read: ElementRef }) keranjangList: QueryList<ElementRef>;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private animate: AnimationController,
    private server: ServerService,
    private storage: StorageService,
    private modal: ModalService,
    private user: UserService,
    private produk: ProdukService,
    private pembelian: PembelianService
  ) {
    produk.getDataKeranjang()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataKeranjang = data;
      this.totalBayar = data.map(v => v.produk.harga * v.jumlah).reduce((a, c) => a + c, 0);
    })

    user.getDataUser()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataUser = data;
    })

    if(produk.getValueKeranjang().length < 1){
      this.ambilKeranjang();
    }
  }

  ionViewDidEnter(){
    if(!this.user.getValueUser()){
      this.storage.getDecodedStorage('user:data').then((data: any) => {
        this.user.setDataUser(data);
      })
    }
  }

  ambilKeranjang(){
    this.keranjangLoading = 1;
    this.server.keranjang(this.dataUser? this.dataUser._id : null).then(data => {
      console.log(data)
      if(data.success){
        this.keranjangLoading = 0;
        this.produk.setDataKeranjang(data.keranjang);
      }else{
        this.keranjangLoading = 2;
      }
    }).catch(err => {
      this.keranjangLoading = 2;
      console.log(err);
    })
  }

  ngOnDestroy(){
		this.destroy$.next();
		this.destroy$.complete();
  }

  tambah(i){
    this.dataKeranjang[i].jumlah += 1;
    this.ubahJumlah(i);
  }

  kurangi(i){
    if(this.dataKeranjang[i].jumlah < 2) return;
    this.dataKeranjang[i].jumlah -= 1;
    this.ubahJumlah(i)
  }

  ubahJumlah(i){
    this.server.editKeranjang({
      idUser: this.dataUser._id, 
      idProduk: this.dataKeranjang[i].produk._id, 
      jumlah: this.dataKeranjang[i].jumlah < 1? 1 : this.dataKeranjang[i].jumlah}).then(data => {
      console.log(data)
    }).catch(err => {
      console.log(err)
    })
    if(this.dataKeranjang[i].jumlah < 1) {
      // setTimeout(_ => {
      //   this.dataKeranjang[i].jumlah = 1;
      //   this.produk.setDataKeranjang(this.dataKeranjang)
      // }, 500)
    }else{
      this.produk.setDataKeranjang(this.dataKeranjang)
    }
  }

  blur(i){
    if(this.dataKeranjang[i].jumlah < 1) {
      this.dataKeranjang[i].jumlah = 1;
      this.produk.setDataKeranjang(this.dataKeranjang)
      // this.cdr.detectChanges();
    }
  }

  hapus(i){
    let k = this.dataKeranjang[i]
    this.modal.showConfirm('Hapus Dari Keranjang', 'Apakah anda ingin menghapus produk <b>"' + k.produk.nama + '"</b> dari keranjang', ['Batal', 'Hapus']).then(data => {
      if(data){
        this.modal.showLoading('Menghapus Data Produk "' + k.produk.nama + '" Dari Keranjang...');
        const deleteAnimation = this.animate.create()
        .addElement(this.keranjangList.toArray()[i].nativeElement)
        .duration(200)
        .easing('ease-out')
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateX(0)', 'translateX(-100%)');

        this.server.hapusKeranjang({idUser: this.dataUser._id, idProduk: k.produk._id}).then(data => {
          console.log(data)
          this.modal.hideLoading();
          if(data.success){
            deleteAnimation.play();
            setTimeout(_ => {
              this.produk.setDataKeranjang(this.produk.getValueKeranjang().filter(v => v.produk._id != k.produk._id));
            }, 500)
          }else{
            this.modal.showToast('Gagal Menghapus Produk Dari Keranjang', 'danger')
          }
        }).catch(err => {
          this.modal.showToast('Gagal Menghapus Produk Dari Keranjang', 'danger')
          console.log(err)  
        })
      }
    })
  }

  // ketika mau bayar harus pilih alamat dulu... jika alamat hanya satu maka default otomatis pilih alamat itu..
  bayar(){
    console.log(this.dataKeranjang);

    if(this.user.getValueUser().saldo < this.totalBayar){
      this.modal.showConfirm('Saldo Tidak Mencukupi', 'Saldo anda tidak mencukupi untuk belanja dengan total <b>Rp. ' + this.totalBayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '</b>');
      return;
    }
    this.modal.showLoading('Menyimpan Data Pembelian...');
    this.server.tambahPembelian({
      produk: this.dataKeranjang,
      user: this.dataUser,
      jumlah: this.totalBayar,
    }).then(data => {
      console.log(data)
      this.modal.hideLoading();
      if(data.success){
        this.pembelian.setDataPembelian([...this.pembelian.getValuePembelian(), data.pembelian]);
        setTimeout(_ => {
          this.router.navigate(['/public/pembelian/detail', {idPembelian: data._id}])
          this.produk.setDataKeranjang([]);
        }, 500)
      }else{
        this.modal.showToast('Gagal Melakukan Topup', 'danger')
      }
    }).catch(err => {
      this.modal.hideLoading();
      console.log(err)
    //   this.modal.showToast('Gagal Melakukan Topup', 'danger')
    })
  }

  get otherServer(){
    return this.server.otherServer;
  }
}