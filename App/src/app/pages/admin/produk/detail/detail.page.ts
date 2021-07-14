import { Component, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../../services/server/server.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { ProdukService, Produk } from '../../../../services/produk/produk.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();

  idProduk;
  dataProduk: Produk;

  constructor(
  	private navCtrl: NavController,
  	private active: ActivatedRoute,
    private server: ServerService,
    private modal: ModalService,
    private produk: ProdukService) {
  	active.params
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataProduk = produk.getValueProduk().find(v => v._id == data['idProduk']);
    	this.idProduk = data['idProduk'];
    })

  }

  ionViewDidEnter(){
    if(this.produk.getValueProduk().length < 1){
      this.ambilProduk();
    }
  }

  ambilProduk(){
    this.modal.showLoading('Memuat data produk...');
    this.server.ambilProduk().then(data => {
      this.modal.hideLoading();
      console.log(data);
      if(data.success){
        this.produk.setDataProduk(data.produk);
        this.dataProduk = data.produk.find(v => v._id == this.idProduk);
      }
    }).catch(err => {
      this.modal.hideLoading();
      console.log(err)
    })
  }

  hapus(){
    if(!this.dataProduk) return;
    this.modal.showConfirm('Hapus Produk', 'Apakah anda yakin ingin menghapus produk <b>"' + this.dataProduk.nama + '"</b>', ['Batal', 'Hapus']).then(data => {
      if(data){
        this.modal.showLoading('Menghapus produk...');
        this.server.hapusProduk(this.dataProduk._id).then(data => {
          this.modal.hideLoading();
          console.log(data)
          if(data.success){
            this.modal.showToast('Berhasil Menghapus Proudk', 'success', 2000, 'bottom', false, true)
            this.produk.setDataProduk(this.produk.getValueProduk().filter(v => v._id != this.dataProduk._id))
            setTimeout(_ => {
              this.goBack();
            }, 500)
          }else {
            this.modal.showToast('Gagal Menghapus Proudk', 'danger', 2000, 'bottom', false, true)
          }
        }).catch(err => {
          this.modal.hideLoading();
          this.modal.showToast('Gagal Menghapus Proudk', 'danger', 2000, 'bottom', false, true);
          console.log(err);
        })
      }
    })
  }

  stok(){
    this.modal.showPrompt('Ubah Stok', 'Ubah stok produk <b>"' + this.dataProduk?.nama + '"</b>', [{
      name: 'stok',
      type: 'number',
      placeholder: 'Isikan stock saat ini',
      value: (this.dataProduk?.stok || 0)
    }]).then(data => {
      console.log(data)
      if(data?.data?.values?.stok){
        this.modal.showLoading('Menyimpan stok...');
        this.server.editStok({_id: this.dataProduk?._id, stok: data.data.values.stok}).then(data => {
          console.log(data)
          this.modal.hideLoading();
          if(data.success){
            this.modal.showToast('Berhasil mengubah stok', 'success');
            this.produk.setDataProduk(this.produk.getValueProduk().map(v => {
              if(v._id == this.dataProduk?._id) v.stok = data.produk.stok;
              return v;
            }))
          }else{
            this.modal.showToast('Gagal mengubah stok', 'danger');
          }
        }).catch(err => {
          this.modal.hideLoading();
          this.modal.showToast('Gagal mengubah stok', 'danger');
          console.log(err);
        })
      }
    })
  }

  goBack(){
  	this.navCtrl.back();
  }

  ngOnDestroy() {
  	this.destroy$.next();
    this.destroy$.complete();
  }

  get otherServer(){
    return this.server.otherServer;
  }

}
