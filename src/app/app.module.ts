import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { SafeHttp } from './app.safe-http';
import { NetworkService } from './app.network-service';
import { Diagnostic } from '@ionic-native/diagnostic';

import { MyApp } from './app.component';
import { LoginProvider } from "../providers/login/login.provider";

@NgModule({
  declarations: [
    MyApp, 
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LoginProvider,
    Network,
    NetworkService,
    SafeHttp,
    Diagnostic
  ]
})
export class AppModule {}
