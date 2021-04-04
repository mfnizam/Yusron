import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ServerService } from '../../../services/server/server.service';
import { StorageService } from '../../../services/storage/storage.service';
import { ModalService } from '../../../services/modal/modal.service';
import { UserService } from '../../../services/user/user.service';

@Component({
	selector: 'app-masuk',
	templateUrl: './masuk.page.html',
	styleUrls: ['./masuk.page.scss'],
})
export class MasukPage {
	eAn;
	password;

	nomerTlpRegex = /(\+62\s?|^0)(\d-?){7,}/; // /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/g;
	emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	isEmail = true;
	btnDisabled = true;
	isLoading = false;
	loginMsg;
	eAnErr;
	showPass = false;

	constructor(
		private router: Router,
		private server: ServerService,
		private storage: StorageService,
		private modal: ModalService,
		private user: UserService) { }

	inputChange(){
		this.eAnErr = null;
		this.loginMsg = null;
		if(this.nomerTlpRegex.test(this.eAn)){
			this.isEmail = false;
			this.btnDisabled = false;
		}else if(this.emailRegex.test(this.eAn)){
			this.isEmail = true;
			this.btnDisabled = this.password? false : true;
		}else{
			this.isEmail = true/*false*/;
			this.btnDisabled = true;
		}
	}

	masuk(){
		this.isLoading = true;

		this.server.masuk(this.eAn, this.password, this.isEmail).then(data => {
			this.isLoading = false;
			if(data.success && data.isEmail){
        this.storage.setStorage('user:data', data.token);
        let decode: any = this.storage.decodeJwt(data.token);
        this.user.setDataUser(decode);
        this.router.navigateByUrl('/');
      }else if(data.success && !data.isEmail){
        this.router.navigate(['/kode', 1, this.eAn])
      }else {
        this.loginMsg = (data.isEmail? 'Email ' : data.iseAn? 'No Tlp ' : '') + data.msg;
        this.eAnErr = data.iseAn;
      }
		}).catch(err => {
			this.isLoading = false;
			this.modal.showToast('Terjadi Kesalahan, mohon coba beberapa saat lagi.', 'danger')
		})
	}

}
