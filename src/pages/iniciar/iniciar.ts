import { HttpErrorResponse } from '@angular/common/http';
import { DetalheNotificacao } from '../../model/detalhe-notificacao-model';
import { NotificacaoProvider } from '../../providers/notificacao/notificacao.provider';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';
import { AlertController, ToastController } from 'ionic-angular';
import { Platform, Alert } from 'ionic-angular';
import { Badge } from '@ionic-native/badge';

import { OneSignal, OSNotificationPayload } from '@ionic-native/onesignal';

import { UsuarioModel } from '../../model/usuario-model';
import { LoginProvider } from '../../providers/login/login.provider';
import { TipoAtendimentoModel } from '../../model/tipoatendimento-model';
import { TipoAtendimentoProvider } from "../../providers/tipo-atendimento/tipo-atendimento.provider";
import { StorageProvider } from '../../providers/storage/storage.provider';
import { PropostaModel } from '../../model/proposta-model';
import { NotificacaoModel } from '../../model/notificacao-model';
import { ErrorHandler } from '../../app/app-error-handler';
import { AlertService } from '../../utils/alert.service';



@IonicPage()
@Component({
  selector: 'page-iniciar',
  templateUrl: 'iniciar.html',
})
export class IniciarPage {

  tpsAtds: TipoAtendimentoModel[];
  
  usuarioLogado: UsuarioModel;

  qtdNotificacoes: number;

  fakeItems: Array<any> = new Array(4);

  showFake: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tpAtdProvider: TipoAtendimentoProvider,
    private loginProvider: LoginProvider,
    private storageProvider: StorageProvider,
    private alertCtrl: AlertController,
    private badge: Badge,
    private platform: Platform,
    public oneSignal : OneSignal,
    private toastCtrl: ToastController,
    private notificacaoProvider: NotificacaoProvider,
    private alertService: AlertService
  ) {

    this.usuarioLogado = this.loginProvider.getUsuarioLogado();

    platform.ready()
      .then(() => {
        
        if (platform.is('cordova')){
          this.prepareNotifications();
        }   
        
    });
    
  }

  ionViewDidEnter(){

    this.initialize();

  }

  async initialize() {

    if (this.usuarioLogado){

      try {

        this.tpsAtds = await this.tpAtdProvider.tiposAtendimentos();

      } catch (error) {
        
        if (error instanceof HttpErrorResponse && error.status == 400){
          this.showAlert("Sessão expirada...Por favor faça o login novamente")
        }else{
          this.showAlert("Ocorreu um erro inesperado, tente novamente mais tarde...");
        }

        this.tpsAtds = [];

      } finally {
        
        this.showFake = false;
        
      }
        
    }else{
      
      this.usuarioLogado = new UsuarioModel();

    }

  }

  prepareNotifications(){

    this.oneSignal.startInit("120907ba-b9de-4717-9395-38dd5a54b6b8", "214682051360");

    this.initOneSignalId();

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationOpened()
      .subscribe(data => { 
        this.receivePush(data.notification.payload);
      });

    this.oneSignal.endInit();

  }  

  initOneSignalId(){
    this.oneSignal.getIds()
      .then(ids => {
        this.storageProvider.setOneSignalId(ids.userId);
      });
  }  

  receivePush(msg: OSNotificationPayload){

    try {
      
      let dialog : Alert;
  
      const msgJSON: any = msg.additionalData;
  
      const proposta: PropostaModel = msgJSON.proposta;
  
      if (msgJSON.tipo !== "notice"){
  
        let notificacao: NotificacaoModel = new NotificacaoModel();
  
        notificacao.msg = msg.body;
  
        let detalheNotificacao: DetalheNotificacao;
  
        detalheNotificacao = msgJSON;
  
        notificacao.dados = detalheNotificacao;
  
        this.notificacaoProvider.salvarNotificacaoSessao(notificacao);
  
        this.increaseBadges();
  
      }else{
  
        dialog = this.alertCtrl.create({
          title: 'Atenção',
          message: msgJSON.msg,
          buttons: [
            {
              text: 'Ok',
              role: 'cancel'
            }
          ]
        });  
        
        dialog.present();    
  
      }

    } catch (error) {

      alert(error);
      
    }

  }

  aceitarProposta(proposta: PropostaModel) {

    try{
    
      this.oneSignal.getIds()
        .then((next) => {
        
          let body = {
            tipo: "aceitaProposta",
            msg: `O Profissional ${proposta.profissional.usuario.nome} está disponível para lhe atender! Clique Ok para continuar`,
            proposta: proposta
          }

          let notificationOBJ: any = {
            contents: {en: `Olá! Encontramos um Fisioterapeuta para lhe atender!`},
            include_player_ids: [proposta.cliente.onesignalId],
            data: body
          };  

          this.oneSignal.postNotification(notificationOBJ)
            .then((res) => {
    
              this.presentToast("Por favor, aguarde a resposta do Paciente");
    
            })
            .catch((erro) => {
    
              throw new Error(erro);
              
            });

        });

    }catch(error){
    
      this.presentToast("Ocorreu um erro, por favor tente mais tarde...");

    }       

    
  }  

  recusarProposta(proposta: PropostaModel) {

    try{
    
      this.oneSignal.getIds()
        .then((next) => {
        
          let body = {
            tipo: "recusaProposta",
            msg: `O Fisioterapeuta ${proposta.profissional.usuario.nome} encontra-se indisponível no momento, deseja fazer nova requisição? `
          }

          let notificationOBJ: any = {
            contents: {en: `Desculpe... Fisioterapeuta indisponível no momento!`},
            include_player_ids: [proposta.cliente.onesignalId],
            data: body
          };  
          
          this.oneSignal.postNotification(notificationOBJ)
            .then((res) => {
    
              this.presentToast("Sua resposta foi enviada ao Paciente");
    
            })
            .catch((erro) => {
    
              throw new Error(erro);
              
            });

        });

    }catch(error){
    
      this.presentToast("Ocorreu um erro, por favor tente mais tarde...");

    }       
    
  }  

  initProposta(tipoAtendimento: TipoAtendimentoModel){
    this.navCtrl.push('PropostaInitPage', {'tipoAtendimento': tipoAtendimento});
  }

  showAlert(msg: string) {
    let networkAlert = this.alertCtrl.create({
      title: 'Atenção',
      message: msg,
      buttons: ['Ok']
    });
    
    networkAlert.present();
  }  

  presentToast(msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top'
    });
  
    toast.present();
  } 
  
  async getBages(){

    try {

      let qtdBadges = await this.badge.get(); 

      this.qtdNotificacoes = qtdBadges;

    } catch (error) {
      
      ErrorHandler.handlerError(error);
      
    }

  }

  async requestPermission() {

    try {
      
      let hasPermission = await this.badge.hasPermission();

      if (!hasPermission) {
        await this.badge.registerPermission();
      }

    } catch (e) {
      console.error(e);
    }

  }

  async clearBadges(){
    
    try {
      
      await this.requestPermission();

      await this.badge.clear();

      this.qtdNotificacoes = await this.badge.get();

    } 
    catch (error) {
      ErrorHandler.handlerError(error);
    }

  }

  async increaseBadges(){

    try {

      await this.requestPermission();

      await this.badge.increase(Number("1"))

      this.qtdNotificacoes = await this.badge.get();

    }
    catch (error) {
      alert(error);
    }

  }

  async decreaseBadges(){

    try {
      
      await this.requestPermission();

      await this.badge.decrease(Number("1"));

      this.qtdNotificacoes = await this.badge.get();

    }
    catch (error) {
      console.log(error);
    }

  }    

  getNotifications(){
    
    if(this.qtdNotificacoes < 1){
      return null;
    }

    return this.qtdNotificacoes;
    
  }

  public navToNotifications(){
    this.navCtrl.push('NotificationsViewsPage');
  }

  public clearNots(){
    this.notificacaoProvider.limparNotificacoes();
  }

  isCliente(): boolean{
    try {
      return this.usuarioLogado.perfil.descricao == 'ROLE_CLIENTE';
    } catch (error) {
      return false;      
    }
  }

  isProfissional(): boolean{
    try {
      return this.usuarioLogado.perfil.descricao == 'ROLE_PROFISSIONAL';
    } catch (error) {
      return false;      
    }
  }  
  
}
