import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ServerService } from '../../../services/server/server.service';
import { StorageService } from '../../../services/storage/storage.service';

@Component({
  selector: 'app-daftar',
  templateUrl: './daftar.page.html',
  styleUrls: ['./daftar.page.scss'],
})
export class DaftarPage {
	
  form: FormGroup = new FormGroup({
    eAn: new FormControl(null, [Validators.required, Validators.email]),
    nama: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    confPassword: new FormControl(null, [Validators.required])
  })

  // nomerTlpRegex = /(\+62\s?|^0)(\d-?){7,}/; // /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/g;
  // emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  isEmail = true;
  isLoading = false;
  loginMsg = '';
  showPass = false;

  eAnErr = false;

  constructor(
  	private navCtrl: NavController,
    private router: Router,
    private server: ServerService,
    private storage: StorageService,
    ) { }

  inputChange(){
    // this.loginMsg = null;
    // this.eAnErr = false;
    // this.confErr = false;
    // if(this.emailRegex.test(this.eAn)){
    //   this.isEmail = true;
    //   this.btnDisabled = this.password && this.confPassword && this.nama? false : true;
    // }else if(this.nomerTlpRegex.test(this.eAn)){
    //   this.isEmail = false;
    //   this.btnDisabled = this.nama? false : true;;
    // }else{
    //   this.isEmail = true;
    //   this.btnDisabled = true;
    // }
  }

  daftar(){
    this.loginMsg = this.isEmail && (this.form.controls['password'].value != this.form.controls['confPassword'].value)? 'Password dan Konfirmasi Password harus sama' : null;
    
    if(this.loginMsg) return;
    this.isLoading = true;
    console.log(this.isEmail);
    this.server.predaftar(this.form.controls['eAn'].value, this.form.controls['nama'].value, this.form.controls['password'].value, this.isEmail? true : false).then(data => {
      this.isLoading = false;
      if(data.success && data.isEmail){
        this.storage.setStorage('user:data', data.token).then(_ => {
          this.router.navigateByUrl('/');
          this.form.controls['eAn'].setValue(null);
          this.form.controls['nama'].setValue(null);
          this.form.controls['password'].setValue(null);
          this.form.controls['confPassword'].setValue(null);
        })
      }else if(data.success && !data.isEmail){
        // this.navCtrl.navigateForward('/kode/' + this.eAn + '/' + 0)
        this.router.navigate(['/kode', 0, this.form.controls['eAn'].value, this.form.controls['nama']])
      }else {
        console.log(data.msg);
        this.loginMsg = data.isEmail? 'Email ': 'No Tlp ' + data.msg;
        this.eAnErr = data.iseAn;
      }
    }).catch(err => {
      console.log(err);
      this.isLoading = false;
    })
  }

  goBack(){
    this.navCtrl.back();
  }

}
