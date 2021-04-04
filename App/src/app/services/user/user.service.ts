import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

export class User {
	_id: string;
	email: string;
	namaLengkap: string;
	noTlp?: string;
	imgUrl?: string;
	jenisKelamin?: number;
	tglLahir?: string;
	alamat?: string;
	saldo: number = 0;
	isAdmin?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private dataUser: BehaviorSubject<User> = new BehaviorSubject<User>(null);
	dataUser_ = this.dataUser.asObservable();

	constructor() { }

	setDataUser(data: User){ this.dataUser.next(data) }
  getDataUser(){ return this.dataUser_ }
  getValueUser(){ return this.dataUser.getValue() };
}
