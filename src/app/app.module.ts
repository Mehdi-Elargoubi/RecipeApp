import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp({
      "projectId": "devopsapi-eilco",
      "appId": "1:1008955243687:web:58ebd75d44cf66f787af82",
      "storageBucket": "devopsapi-eilco.firebasestorage.app",
      "apiKey": "AIzaSyCs0g2r6siR8w4FkhoQT2h4KyS5tATelGc",
      "authDomain": "devopsapi-eilco.firebaseapp.com",
      "messagingSenderId": "1008955243687"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
