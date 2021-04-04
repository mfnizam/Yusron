import { Injectable } from '@angular/core';

import { Plugins } from '@capacitor/core';
const { Modals, Toast } = Plugins;

import { 
  AlertController, 
  ToastController, 
  ActionSheetController, 
  LoadingController, 
  ModalController,
  PopoverController
} from '@ionic/angular';

import { PopoverComponent } from './popover/popover.component';

import { ModalComponent } from './modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private l;
  private t: HTMLIonToastElement;

  constructor(
    private alert: AlertController,
    private toast: ToastController,
    private action: ActionSheetController,
    private loading: LoadingController,
    private modal: ModalController,
    private popover: PopoverController) { }

  async showAlert(t, m, btn = ['OK']){
    const alert = await  this.alert.create({
      cssClass: 'alert-custom',
      header: t,
      // subHeader: t,
      message: m,
      buttons: btn,
      mode: 'ios'
    })
    return await alert.present();
  }

  showConfirm(t, m, btnt = ['Cancel', 'Ok']) : Promise<boolean>{
    return new Promise((resolve, reject) => {
      this.alert.create({
        cssClass: 'alert-custom',
        header: t,
        // subHeader: t,
        message: m,
        buttons: [{
          text: btnt[0],
          role: 'cancel',
          handler: () => resolve(false)
        }, {
          text: btnt[1],
          handler: () => resolve(true)
        }],
        mode: 'ios'
      }).then(p => p.present())
    })
  }

  async showToast(t, color: string = 'dark', d: number = 2000, p = 'bottom', stack = true, aboveTab = false){
    if(stack){
      let to = await this.toast.create({
        message: t,
        duration: d,
        color: color,
        mode: 'ios',
        cssClass: 'taost-custom ' + (aboveTab? 'toast-ab' : ''),
        buttons: [{
          text: 'Selesai',
          role: 'cancel'
        }]
      });

      to.present();
    }else{
      try{
        this.t.dismiss();
      }catch(err){}

      this.t = await this.toast.create({
        message: t,
        duration: d,
        color: color,
        mode: 'ios',
        cssClass: 'taost-custom ' + (aboveTab? 'toast-ab' : ''),
        buttons: [{
          text: 'Selesai',
          role: 'cancel'
        }]
      });

      this.t.present();
    }
  }

  async showPrompt(h, m, i: Array<any>, b = ['Batal', 'Ok']) {
    let a = await this.alert.create({
      cssClass: 'prompt-custom',
      header: h,
      message: m,
      inputs: i,
      mode: 'ios',
      buttons: [{
        text: b[0],
        role: 'cancel',
      }, {
        text: b[1],
        role: 'ok'
      }]
    })
    await a.present()
    // .then(data => {
    //   // 'alert-input-wrapper'
    // });
    return a.onDidDismiss()
  }

  showAction(t, b: Array<any>) {
    return new Promise((resolve, reject) => {
      b.map(v => {
        v.handler = () => resolve(v.id);
      })
      this.action.create({
        header: t,
        mode: 'ios',
        buttons: b
      }).then(p => p.present())

    })
  }

  async showLoading(t, bd = true, d = 15000){
    this.l = await this.loading.create({
      message: t,
      backdropDismiss: bd,
      mode: 'ios',
      duration: d,
    });
    await this.l.present();
  }
  hideLoading(){
    try{
      if(this.l){
          return this.l.dismiss();
      }else{
        setTimeout(() => {
          if(this.l) return this.l.dismiss();
        }, 1500);
      }
    }catch(err){
      console.log(err);
    }
  }

  async showModal(d, bd = true, c = ModalComponent) {
    const modal = await this.modal.create({
      component: c,
      cssClass: 'modal-custom',
      componentProps: d,
      backdropDismiss: bd,
    });
    await modal.present();
    return await modal.onDidDismiss();
  }

  async showPopover(e, a = true, c = PopoverComponent){
    const popover = await this.popover.create({
      event: e,
      component: c,
      cssClass: 'popover-custom',
      mode: 'ios',
      animated: a
    })
    await popover.present();
    return await popover.onDidDismiss();
  }


  // native modal
  showAlertNative(t, m){
  	return Modals.alert({
  		title: t,
  		message: m
  	});
  }

  showConfirmNative(t, m){
  	return Modals.confirm({
  		title: t,
  		message: m
  	})
  }

  showPromptNative(t, m){
  	return Modals.prompt({
  		title: t,
  		message: m
  	})
  }

  showActionNative(t, m, o){
  	return Modals.showActions({
  		title: t,
  		message: m,
  		options: o
  	})
  }

  showToastNative(t, d: any = "short", p: any = 'bottom'){
  	return Toast.show({
  		text: t,
  		duration: d,
  		position: p
  	})
  }
}
