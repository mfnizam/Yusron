import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../services/server/server.service';
import { ModalService } from '../../../services/modal/modal.service';
import { ProdukService, Produk } from '../../../services/produk/produk.service';

@Component({
  selector: 'app-produk',
  templateUrl: './produk.page.html',
  styleUrls: ['./produk.page.scss'],
})
export class ProdukPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();

	dataProduk: Produk[] = [];
	produkLoading = 0;

  constructor(
    private router: Router,
    private active: ActivatedRoute,
    private server: ServerService,
    private modal: ModalService,
    private produk: ProdukService) {
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
    this.server.ambilProduk().then(data => {
      console.log(data);
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

  ngOnDestroy(){
  	this.destroy$.next();
    this.destroy$.complete();
  }

  openPopover(event, id, nama){
    this.modal.showPopover(event, false).then(data => {
      if(data.role == 'edit'){
        this.router.navigate(['cu', { update: true, idProduk: id}], {relativeTo: this.active})
      }else if(data.role == 'hapus'){
        this.modal.showConfirm('Hapus Produk', 'Apakah anda yakin ingin menghapus produk <b>"' + nama + '"</b>', ['Batal', 'Hapus']).then(data => {
          if(data){
            this.server.hapusProduk(id).then(data => {
              console.log(data)
              if(data.success){
                this.modal.showToast('Berhasil Menghapus Proudk', 'success')
                this.produk.setDataProduk(this.produk.getValueProduk().filter(v => v._id != id))
              }else {
                this.modal.showToast('Gagal Menghapus Proudk', 'danger')
              }
            }).catch(err => {
              this.modal.showToast('Gagal Menghapus Proudk', 'danger');
              console.log(err);
            })
          }
        })
      }
    })
  }
}
