import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MasterService } from '../../../../services/master/master.service';
import { User } from '../../../../services/user/user.service';
import { ServerService } from '../../../../services/server/server.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { ModalComponent } from '../../../../services/modal/modal/modal.component';

@Component({
  selector: 'app-cu',
  templateUrl: './cu.page.html',
  styleUrls: ['./cu.page.scss'],
})
export class CuPage implements OnDestroy {
	private destroy$: Subject<void> = new Subject<void>();
  jenis;
  update = false;
  dataMaster;

  form: FormGroup = new FormGroup({
    namaLengkap: new FormControl(null, [Validators.required]),
    jenisKelamin: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    noTlp: new FormControl(null),
    tglLahir: new FormControl(null),
    alamat: new FormControl(null),
    password: new FormControl(null)
  })

  gantiPass = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private active: ActivatedRoute,
    private navCtrl: NavController,
    private master: MasterService,
    private server: ServerService,
    private modal: ModalService) {
  	active.params
  	.pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      if(!data['jenis']) return this.goBack();

      this.jenis = data['jenis'];
      this.update = data['update'] == 'true'? true : false;
      if(this.jenis == 'kurir'){
        this.dataMaster = this.master.getValueKurir().find(v => v._id == data['id']);
      }else if(this.jenis == 'pembeli'){
        this.dataMaster = this.master.getValuePembeli().find(v => v._id == data['id']);
      }
      this.setForm();
    })

  }

  setForm(){
    if(this.update) {
      this.form.addControl('_id', new FormControl (this.dataMaster?._id, [Validators.required]));
      this.form.controls.namaLengkap.setValue(this.dataMaster?.namaLengkap);
      this.form.controls.jenisKelamin.setValue(Number(this.dataMaster?.jenisKelamin));
      this.form.controls.email.setValue(this.dataMaster?.email)
      this.form.controls.noTlp.setValue(this.dataMaster?.noTlp)
      this.form.controls.tglLahir.setValue(this.dataMaster?.tglLahir)
      this.form.controls.alamat.setValue(this.dataMaster?.alamat)
      this.form.controls.password.setValue(null)
    }
    this.form.controls.password.setValidators(this.dataMaster?.hasPassword && this.update? [] : [Validators.required]);
  }

  ngOnDestroy(){
  	this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(){
  	this.navCtrl.back();
  }

  simpan(){
    this.modal.showLoading('Menambahkan Data');
    if(this.update){
      if(this.jenis == 'kurir'){
        console.log(this.form.value);
        this.server.editKurir(this.form.value).then(data => {
          this.modal.hideLoading();
          console.log(data)
          if(data.success){
            let valKurir = this.master.getValueKurir();
            let ind = valKurir.findIndex(e => e._id == data.kurir._id);
            if(ind < 0) {
              this.modal.showToast('Gagal Menyimpan Data Kurir', 'danger');
              setTimeout(_ => {
                this.goBack();
              }, 500)
              return
            }else{
              valKurir[ind] = data.kurir;
              this.master.setDataKurir(valKurir);
              this.modal.showToast('Berhasil Menyimpan Data Kurir', 'success');
              setTimeout(_ => {
                this.goBack();
              }, 500)
            }
          }else{
            this.modal.showToast('Gagal Menyimpan Data Kurir', 'danger');
          }
        }).catch(err => {
          console.log(err);
          this.modal.hideLoading();
          this.modal.showToast('Gagal Menyimpan Data Kurir', 'danger');
        })
      }else if(this.jenis == 'pembeli'){
        this.server.editPembeli(this.form.value).then(data => {
          this.modal.hideLoading();
          if(data.success){
            let valPembeli = this.master.getValuePembeli();
            let ind = valPembeli.findIndex(e => e._id == data.pembeli._id);
            if(ind < 0) {
              this.modal.showToast('Gagal Menyimpan Data Pembeli', 'danger');
              setTimeout(_ => {
                this.goBack();
              }, 500)
              return
            }else{
              valPembeli[ind] = data.pembeli;
              this.master.setDataPembeli(valPembeli);
              this.modal.showToast('Berhasil Menyimpan Data Pembeli', 'success');
              setTimeout(_ => {
                this.goBack();
              }, 500)
            }
          }else{
            this.modal.showToast('Gagal Menyimpan Data Pembeli', 'danger');
          }
        }).catch(err => {
          console.log(err);
          this.modal.hideLoading();
          this.modal.showToast('Gagal Menyimpan Data Pembeli', 'danger');
        })
      } 
    }else{
      if(this.jenis == 'kurir'){
        this.server.tambahKurir(this.form.value).then(data => {
          this.modal.hideLoading();
          console.log(data);
          if(data.success){
            this.master.setDataKurir([...this.master.getValueKurir(), data.kurir]);
            this.modal.showToast('Berhasil Menambahkan Kurir', 'success');
            setTimeout(_ => {
              this.goBack();
            }, 500)
          }else{
            this.modal.showToast('Gagal Menambahkan Kurir', 'danger');
          }
        }).catch(err => {
          console.log(err);
          this.modal.hideLoading();
          this.modal.showToast('Gagal Menambahkan Kurir', 'danger');
        })
      }else if(this.jenis == 'pembeli'){
        this.server.tambahPembeli(this.form.value).then(data => {
          this.modal.hideLoading()
          console.log(data, 'tambah pembeli')
          if(data.success){
            this.master.setDataPembeli([...this.master.getValuePembeli(), data.pembeli]);
            this.modal.showToast('Berhasil Menambahkan Pembeli', 'success');
            setTimeout(_ => {
              this.goBack();
            }, 500)
          }else{
            this.modal.showToast('Gagal Menambahkan Pembeli', 'danger');
          }
        }).catch(err => {
          console.log(err);
          this.modal.hideLoading();
          this.modal.showToast('Gagal Menambahkan Pembeli', 'danger');
        })
      }
    }
  }
}
