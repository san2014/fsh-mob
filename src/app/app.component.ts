import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ToastController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import {OneSignal} from "@ionic-native/onesignal";

import { LoginProvider } from './../providers/login/login.provider';
import { UsuarioModel } from "../model/usuario-model";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: string = 'HomePage';

  @ViewChild(Nav) nav: Nav;

  menuSections: Array<{title: string, component: any}>

  usuario: UsuarioModel;
  
  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private loginProvider: LoginProvider,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public oneSignal : OneSignal
    ) {

      this.initialize();

      platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        splashScreen.hide();
        statusBar.backgroundColorByHexString('#236B8E');

        this.menuSections = [
          {title: 'Dados Cadastrais', component: 'UserRegister' },
          {title: 'Meu Histórico', component: 'IniciarPage'},
          {title: 'Avalie-nos', component: 'IniciarPage'},
        ];

        if (platform.is('cordova')){
          this.prepareNotifications();
        }          

      });

  }

  initialize(){
    this.usuario = new UsuarioModel();
  }

  receivePush(msg: any){
    let networkAlert = this.alertCtrl.create({
      title: 'Nova Requisição',
      message: msg,
      buttons: [
        {
          text: 'Recusar',
          role: 'cancel'
        },
        {
          text: 'Aceitar',
          handler: () => {
            alert('Aguarde implementação....');
          }
        }
      ]
    });
    
    networkAlert.present();    
  }

  prepareNotifications(){

    this.oneSignal.startInit("120907ba-b9de-4717-9395-38dd5a54b6b8", "214682051360");
    
    this.oneSignal.handleNotificationOpened()
      .subscribe(data => {
        this.receivePush(JSON.stringify(data));
      });

    this.loginProvider.checkOneSignalId();

    this.oneSignal.endInit();

  }

  presentToast(msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top'
    });
  
    toast.present();
  } 
  
  deslogar() {
    let alert = this.alertCtrl.create({
      title: 'Logout',
      message: 'Deseja deslogar do nosso aplicativo?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel'
        },
        {
          text: 'Sim',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    alert.present();
  }  

  navToComponent(component: any){
    this.nav.push(component); 
  }

  logout(){
    this.loginProvider.logout()
      .then((response)=> {
        this.presentToast(response.msg);
        this.navToComponent("HomePage");
      }).catch((erro) => {
        this.presentToast(erro.msg);
      })
  }

  pushRegister(){
    this.navToComponent("ProfInfoRegisterPage");
  }

}

