import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../../services/server/server.service';
import { CameraService } from '../../../../services/camera/camera.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { MasterService, Kategori } from '../../../../services/master/master.service';
import { ProdukService, Produk } from '../../../../services/produk/produk.service';

@Component({
  selector: 'app-cu',
  templateUrl: './cu.page.html',
  styleUrls: ['./cu.page.scss'],
})
export class CuPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();

  update = false;
  form: FormGroup = new FormGroup({
    nama: new FormControl(null, [Validators.required]),
    harga: new FormControl(null, [Validators.required]),
    kategori: new FormControl(null, [Validators.required]),
    diskon: new FormControl(null, [Validators.max(100), Validators.min(0)]),
    stok: new FormControl(1, [Validators.required]),
  })

  photo = [];
  photoName = [];
  photoOriginal = [];
  kategori: Kategori[] = [];

  constructor(
    private active: ActivatedRoute,
  	private navCtrl: NavController,
    private server: ServerService,
    private camera: CameraService,
    private modal: ModalService,
    private master: MasterService,
    private produk: ProdukService
    ) {
    active.params
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      console.log(data);
      this.update = data['update'] == 'true'? true : false;

      if(this.update){
        this.form.addControl('_id', new FormControl(data['idProduk'], [Validators.required]));
        let produk = this.produk.getValueProduk().find(v => v._id == data['idProduk']);
        if(produk){
          this.photo = produk.imgUrl.map(v => this.otherServer + v);
          this.photoName = produk.imgUrl.map((v, i) => 'foto-' + i);
          this.photoOriginal = this.photo;
          this.form.controls.nama.setValue(produk.nama);
          this.form.controls.harga.setValue(produk.harga);
          this.form.controls.kategori.setValue(produk.kategori?._id? produk.kategori._id : produk.kategori);
          this.form.controls.diskon.setValue(produk.diskon);
          this.form.controls.stok.setValue(produk.stok);
        }
      }
    })

    master.getDataKategori()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.kategori = data;
    })

    if(master.getValueKategori().length < 1){
      server.ambilKategori().then(data => {
        console.log(data)
        if(data.success){
          this.master.setDataKategori(data.kategori)
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }

  ngOnDestroy() {
  	this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(){
  	this.navCtrl.back();
  }

  unggahFotoProduk(p?){
    this.camera.camera('camera').then(async data => {
      console.log(data, 'data from camera')
      this.photo = [...this.photo, data.webPath];
      this.photoName = [...this.photoName, 'foto-' + this.photoName.length];
    })
  }

  hapusFoto(i){
    this.photo.splice(i, 1)
    this.photoName.splice(i, 1)
  }

  simpan(){
    this.modal.showLoading('Menyimpan data produk...');

    if(this.update){
      this.form.value['imgUrl'] = this.photo.filter(v => this.photoOriginal.includes(v)).map(v => v.split(this.otherServer)[1]);
      this.server.editProduk(this.form.value, this.photo.filter(v => !this.photoOriginal.includes(v)), this.photoName).then(data => {
        this.modal.hideLoading();
        console.log(data)
        if(data.success){
          this.modal.showToast('Berhasil Menambahkan Produk', 'success');
          this.produk.setDataProduk(this.produk.getValueProduk().map(v => v._id == data.produk._id? data.produk : v));
          setTimeout(_ => {
            this.goBack();
          }, 500)
        }else{
          this.modal.showToast('Gagal Menambahkan Produk', 'danger')
        }
      }).catch(err => {
        this.modal.hideLoading();
        this.modal.showToast('Gagal Menambahkan Produk', 'danger');
        console.log(err)
      })
    }else{
      this.server.tambahProduk(this.form.value, this.photo, this.photoName).then(data => {
        this.modal.hideLoading();
        console.log(data)
        if(data.success){
          this.modal.showToast('Berhasil Menambahkan Produk', 'success');
          this.produk.setDataProduk([...this.produk.getValueProduk(), data.produk]);
          setTimeout(_ => {
            this.goBack();
          }, 500)
        }else{
          this.modal.showToast('Gagal Menambahkan Produk', 'danger')
        }
      }).catch(err => {
        this.modal.hideLoading();
        this.modal.showToast('Gagal Menambahkan Produk', 'danger');
        console.log(err)
      })
    }
  }

  tambahStok(){
    this.form.controls.stok.setValue(this.form.controls.stok.value + 1);
  }

  kurangiStok(){
    if(this.form.controls.stok.value < 2) return;
    this.form.controls.stok.setValue(this.form.controls.stok.value - 1);
  }

  inputChange(v){
    console.log(v)
  }

  get otherServer(){
    return this.server.otherServer;
  }

}