import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ServerService } from '../../services/server/server.service';
import { StorageService } from '../../services/storage/storage.service';
import { UserService } from '../../services/user/user.service';

import { AnimationController, Animation } from '@ionic/angular';

@Component({
	selector: 'app-kurir',
	templateUrl: 'kurir.page.html',
	styleUrls: ['kurir.page.scss']
})
export class KurirPage implements OnDestroy {
	private destroy$: Subject<void> = new Subject<void>();
	
	@ViewChild('pengirimanTab', { read: ElementRef }) pengirimanTab: ElementRef;
	tabAnimationPengiriman: Animation;

	jumlahPengiriman = 0;

	constructor(
		private server: ServerService,
		private storage: StorageService,
		private animate: AnimationController,
		private user: UserService) {

		// this.user.getDataUser()
		// .pipe(takeUntil(this.destroy$))
		// .subscribe(data => {
		// 	if(!data || !data._id) return
		// })
		
		if(!this.user.getValueUser()){
			this.storage.getDecodedStorage('user:data').then((data: any) => {
				this.ambilUser(data);
			})
		}
	}

	ambilUser(user){
    this.server.akun(user._id).then(async data => {
      if(data.success){
        this.storage.setStorage('user:data', data.token);
        let user: any = await this.storage.decodeJwt(data.token);
        if(JSON.stringify(user) != JSON.stringify(this.user.getValueUser())){
        	console.log('data user baru')
          this.user.setDataUser(user);
        }else{
          this.user.setDataUser(user);
        }
      }else{
        this.user.setDataUser(user);
      }
    }).catch(err => {
      console.log(err);
      this.user.setDataUser(user);
    })
  }

	ngAfterViewInit(){
    this.tabAnimationPengiriman = this.animate.create()
    .addElement(this.pengirimanTab.nativeElement)
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
