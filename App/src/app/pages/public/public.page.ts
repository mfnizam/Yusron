import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../services/server/server.service';
import { StorageService } from '../../services/storage/storage.service';
import { UserService, User } from '../../services/user/user.service';
import { ProdukService } from '../../services/produk/produk.service';
import { PembelianService } from '../../services/pembelian/pembelian.service';

import { AnimationController, Animation } from '@ionic/angular';

@Component({
	selector: 'app-public',
	templateUrl: 'public.page.html',
	styleUrls: ['public.page.scss']
})
export class PublicPage implements OnDestroy {
	private destroy$: Subject<void> = new Subject<void>();
	
	dataUser: User;

	@ViewChild('keranjangTab', { read: ElementRef }) keranjangTab: ElementRef;
	tabAnimationKeranjang: Animation;

	@ViewChild('pembelianTab', { read: ElementRef }) pembelianTab: ElementRef;
	tabAnimationPembelian: Animation;

	jumlahKeranjang = 0;
	jumlahPembelian = 0;

	constructor(
		private server: ServerService,
		private storage: StorageService,
		private animate: AnimationController,
		private user: UserService,
		private produk: ProdukService,
		private pembelian: PembelianService) {
		user.getDataUser()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			if(data && data._id && JSON.stringify(this.dataUser) != JSON.stringify(data)){
				this.dataUser = data;
				this.ambilKerangjang(data._id);
				this.ambilPembelian(data._id);
			}
		})

		produk.getDataKeranjang()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			if(this.tabAnimationKeranjang && this.produk.getValueKeranjang().length != data.length) this.tabAnimationKeranjang.play();
			this.jumlahKeranjang = data.map(v => v.jumlah).reduce((a, c) => a + c, 0);
		})

		pembelian.getDataPembelian()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			if(this.tabAnimationPembelian && this.pembelian.getValuePembelian().length != data.length) this.tabAnimationPembelian.play();
			this.jumlahPembelian = data.filter(v => (v.status == 0 || v.status == 2)).length;
		})

		if(!this.user.getValueUser()){
			this.storage.getDecodedStorage('user:data').then((data: any) => {
				this.user.setDataUser(data);
			})
		}
	}

	ambilKerangjang(user){
		this.server.keranjang(user).then(data => {
			console.log(data)
			if(data.success){
				this.produk.setDataKeranjang(data.keranjang);
			} 
		}).catch(err => {
			console.log(err)
		})
	}

	ambilPembelian(user){
		this.server.pembelian(user).then(data => {
			console.log(data)
			if(data.success){
				this.pembelian.setDataPembelian(data.pembelian);
			}
		}).catch(err => {
			console.log(err)
		})
	}

	ngAfterViewInit(){
    this.tabAnimationKeranjang = this.animate.create()
    .addElement(this.keranjangTab.nativeElement)
    .duration(500)
    .easing('ease-out')
    .keyframes([
    	{ offset: 0, transform: 'scale(.6)' },
    	{ offset: 0.5, transform: 'scale(1.3)' },
    	{ offset: 0.7, transform: 'scale(.9)' },
    	{ offset: 1, transform: 'scale(1)' }
    ])

    this.tabAnimationPembelian = this.animate.create()
    .addElement(this.pembelianTab.nativeElement)
    .duration(500)
    .easing('ease-out')
    .keyframes([
    	{ offset: 0, transform: 'scale(.6)' },
    	{ offset: 0.5, transform: 'scale(1.3)' },
    	{ offset: 0.7, transform: 'scale(.9)' },
    	{ offset: 1, transform: 'scale(1)' }
    ])
	}

	ngOnDestroy(){
		this.destroy$.next();
		this.destroy$.complete();
	}

}
