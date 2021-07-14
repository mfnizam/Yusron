import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { StorageService } from '../../../../services/storage/storage.service';
import { ServerService } from '../../../../services/server/server.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage {
	userData: any; 
  gantiPass = false;
  showPass = false;

  form: FormGroup = new FormGroup({
    idUser: new FormControl(null, [Validators.required]),
    namaLengkap: new FormControl(null, [Validators.required]),
    noTlp: new FormControl(null),
    jenisKelamin: new FormControl(null),
    email: new FormControl(null),
    password: new FormControl(null),
    confPassword: new FormControl(null),
  })

  // isLoading = false;

  constructor(
  	private navCtrl: NavController,
  	private storage: StorageService,
    private server: ServerService,
    private modal: ModalService,
    private user: UserService
  	) { }

  ionViewDidEnter(){
  	this.storage.getDecodedStorage('user:data').then((data: any) => {
      this.userData = data;
      if(data._id) this.form.controls.idUser.setValue(data._id);
      if(data.namaLengkap) this.form.controls.namaLengkap.setValue(data.namaLengkap);
      if(data.noTlp) this.form.controls.noTlp.setValue(data.noTlp);
      if(data.jenisKelamin != null || data.jenisKelamin != undefined) this.form.controls.jenisKelamin.setValue(data.jenisKelamin);
      if(data.email) this.form.controls.email.setValue(data.email);
    })
  }

  goBack(){
    this.navCtrl.back();
  }

  simpan(){
    this.modal.showLoading('Menyimpan perubahan data akun..');
    // this.isLoading = true;
    this.server.akunEdit(this.form.value).then(data => {
      // this.isLoading = false;
      this.modal.hideLoading();
      console.log(data)
      if(data.success){
        this.storage.setStorage('user:data', data.token).then(data => {
          this.storage.getDecodedStorage('user:data').then((data: any) => {
            this.user.setDataUser(data);
          })
        })
        setTimeout(_ => {
          this.goBack();
        }, 500)
        this.modal.showToast('Sukses Menyimpan Data', 'success', 2000, 'bottom', false, true);
      }else{
        this.modal.showToast('Gagal Menyimpan Data, Coba beberapa saat lagi.', 'danger');
      }
    }).catch(err => {
      this.modal.hideLoading();
      // this.isLoading = false;
      this.modal.showToast('Gagal Menyimpan Data, Coba beberapa saat lagi.', 'danger');
      console.log(err);
    })
  }

}
