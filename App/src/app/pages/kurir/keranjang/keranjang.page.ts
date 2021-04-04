import { Component, OnDestroy, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// import { TagihanService, Tagihan, Bayar } from '../../../services/tagihan/tagihan.service';
import { StorageService } from '../../../services/storage/storage.service';
import { User } from '../../../services/user/user.service';
import { ServerService } from '../../../services/server/server.service';
import { ModalService } from '../../../services/modal/modal.service';
import { ModalComponent } from '../../../services/modal/modal/modal.component';
// import { PembayaranService } from '../../../services/pembayaran/pembayaran.service';
// import { MasterService, Rekening } from '../../../services/master/master.service';

import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-keranjang',
  templateUrl: './keranjang.page.html',
  styleUrls: ['./keranjang.page.scss'],
})
export class KeranjangPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();
 //  userData: User;
	dataBayar = [1,2,3,4,5,6,7,8];
 //  bayarLoading = 0;
  totalBayar = 200000;

 //  dataRekening: Rekening[];

 //  @ViewChildren('bayarList', { read: ElementRef }) bayarList: QueryList<ElementRef>;

  constructor(
    // private router: Router,
    private navCtrl: NavController,
    // private tagihan: TagihanService,
    // private animate: AnimationController,
    // private storage: StorageService,
    // private server: ServerService,
    // private modal: ModalService,
    // private pembayaran: PembayaranService,
    // private master: MasterService
    ) {
 //  	this.tagihan.getDataBayar()
 //  	.pipe(takeUntil(this.destroy$))
 //    .subscribe(data => {
 //    	this.dataBayar = data;
 //      this.totalBayar = data.reduce((a, c) =>  a + c.nominal, 0);
 //    })

 //    this.master.getDataRekening()
 //    .pipe(takeUntil(this.destroy$))
 //    .subscribe(data => {
 //      this.dataRekening = data;
 //    })
  }

 //  ionViewDidEnter(){
 //    this.storage.getDecodedStorage('user:data').then((data: any) => {
 //      this.userData = data;
 //      this.ambilBayar(data._id);
 //    })

 //    if(this.master.getValueRekening().length < 1){
 //      this.ambilRekening();
 //    }
 //  }

 //  ambilBayar(idUser){
 //    if(!idUser) return;
 //    this.bayarLoading = 1;
 //    this.server.bayar(idUser).then(data => {
 //      console.log(data);
 //      if(data.success){
 //        this.bayarLoading = 0;
 //        this.tagihan.setDataBayar(data.bayar);
 //      }else{
 //        this.bayarLoading = 2;
 //      }
 //    }).catch(err => {
 //      this.bayarLoading = 2;
 //      console.log(err)
 //    })
 //  }

 //  async ambilRekening(){
 //    await this.server.ambilRekening().then(data => {
 //      console.log(data);
 //      if(data.success) this.master.setDataRekening(data.rekening)
 //    })
 //  }

  ngOnDestroy(){
		this.destroy$.next();
		this.destroy$.complete();
  }

  goBack(){
    this.navCtrl.back();
  }

 //  bayarNanti(id, idSiswa, i){
 //    this.modal.showLoading('Menghapus Tagihan Dari Daftar Bayar');
 //    this.server.bayarNanti(this.userData._id, id, idSiswa).then(data => {
 //      console.log(data);
 //      this.modal.hideLoading();
 //      if(data.success){
 //        let dataBayar = this.dataBayar.find(v => v._id == id && v.siswa._id == idSiswa);
 //        let containerElement = this.bayarList.toArray()[i].nativeElement;
 //        const deleteAnimation = this.animate.create()
 //        .addElement(containerElement)
 //        .delay(500)
 //        .duration(200)
 //        .easing('ease-out')
 //        .fromTo('opacity', '1', '0')
 //        .fromTo('transform', 'translateX(0)', 'translateX(-100%)');
 //        deleteAnimation.play();

 //        setTimeout(() => {
 //          this.tagihan.setDataBayar(this.tagihan.getValueBayar().filter(v => !(v._id == id && v.siswa._id == idSiswa)));
 //          this.tagihan.setDataTagihan([...this.tagihan.getValueTagihan(), dataBayar]);
 //        }, 800)
 //      }else{
 //        this.modal.showToast('Gagal Menghapus Tagihan Dari Daftar Bayar', 'danger');
 //      }
 //    }).catch(err => {
 //      console.log(err)
 //      this.modal.hideLoading();
 //      this.modal.showToast('Gagal Menghapus Tagihan Dari Daftar Bayar', 'danger');
 //    })

 //  }

  async bayar(){
 //    if(!this.userData._id || !this.dataBayar) return this.modal.showToast('Tidak dapat melakukan pembayaran, Coba beberapa saat lagi.');
    
 //    let loading = false;
 //    if(this.dataRekening.length < 1) {
 //      loading = true;
 //      this.modal.showLoading('Memuat Rekening Pembayaran...', false, 0)
 //      await this.ambilRekening();
 //    }
    
 //    if(loading) this.modal.hideLoading();

 //    if(this.dataRekening.length < 1) return this.modal.showToast('Gagal Melakukan Pembayaran, Coba beberapa saat lagi.', 'warning')
    
 //    this.modal.showModal({
 //      jenis: 'select',
 //      header: 'Pilih Jenis Rekening Pembayaran',
 //      data: this.master.getValueRekening().map(v => { 
 //        return {
 //          id: v._id, 
 //          title: v.namaBank + ' - ' + v.atasNama, 
 //          imgUrl: false,
 //          subTitle: /*'<small>' + */v.noRek/* + '</small>'*/,
 //        };
 //      }),
 //      multiple: false,
 //      search: false,
 //      button: [{ 
 //        title: 'Batal', 
 //        role: 'batal'
 //      }, {
 //        title: 'Pilih', 
 //        submit: true/* role pada submit selalu 'ok'*/
 //      }]
 //    }, ModalComponent).then(data => {
 //      console.log(data)
 //      if(data.role == 'ok'){
 //        if(data.data.nonmultiple){
 //          this.modal.showLoading('Memuat data untuk pembayaran, Mohon tidak menutup aplikasi...', false, 0);
 //          let dataBayar: Bayar[] = this.dataBayar.map(v => {
 //            return { tagihan: v._id, siswa: v.siswa._id }
 //          })
 //          this.server.bayarPembayaran(this.userData._id, data.data.nonmultiple, dataBayar).then(data => {
 //            console.log(data);
 //            if(data.success){
 //              this.server.bayar(this.userData._id).then(data => { if(data.success) this.tagihan.setDataBayar(data.bayar); }).catch(err => { console.log(err) })
 //              // this.server.pembayaran(this.userData._id).then(data => { if(data.success) this.pembayaran.setDataPembayaran(data.pembayaran) }).catch(err => { console.log(err) })
 //              setTimeout(_ => {
 //                this.modal.hideLoading();
 //                this.pembayaran.setDataPembayaran([...this.pembayaran.getValuePembayaran(), data.pembayaran])
 //                this.router.navigate(['/public/pembayaran/detail', {id: data.pembayaran._id}])
 //              }, 500);
 //            }else{
 //              this.modal.hideLoading();
 //              this.modal.showToast('Gagal memuat data untuk pembayaran');
 //            }
 //          }).catch(err => {
 //            console.log(err);
 //            this.modal.hideLoading();
 //            this.modal.showToast('Gagal memuat data untuk pembayaran');
 //          })
 //        }else{
 //          this.modal.showToast('Pilih Jenis Rekening Untuk Melanjutkan Pembayaran');
 //        }
 //      }
 //    })
  }
}
