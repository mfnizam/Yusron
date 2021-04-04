import { Injectable } from '@angular/core';
import { Capacitor, Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
const { Camera } = Plugins;

@Injectable({
	providedIn: 'root'
})
export class CameraService {

	constructor(
		private barcode: BarcodeScanner) { }
	
	camera(s = 'camera', q = 90, rt = 'uri', ae = false, stg = true) {
		return Camera.getPhoto({
			quality: q,
			allowEditing: ae,
			resultType: rt == 'uri'? CameraResultType.Uri : rt == 'base64'? CameraResultType.Base64 : CameraResultType.DataUrl,
			saveToGallery: stg,
			source: s == 'camera'? CameraSource.Camera : s == 'camera'? CameraSource.Photos : CameraSource.Prompt
		});
	}

	scanbarcode(){
		if(Capacitor.isNative){
			return this.barcode.scan({prompt: 'Tempatkan QR Code di area scan', resultDisplayDuration: 0})
		}else{ 
			return new Promise((res, rej) => {
				res({cancelled: false, msg: 'Bukan device native'})
			}).then((data: any) => data)
		}
	}
}
