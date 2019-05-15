import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app.routing';
import { SharedModule } from './shared/shared.module';
import { AppInterceptor } from './app.interceptor';
import { MetadataResolver } from './shared/services/httpServices/metadata-resolver.service';
import { ServerTransferStateModule } from '@angular/platform-server';
import { EventDetailsResolver } from './shared/services/httpServices/event-details-resolver.service';

import { NgAisModule } from 'angular-instantsearch';

import {
  HeaderComponent,
  FooterComponent,
  HeaderNavigationModalComponent
} from './core';

import {
  AppService,
  TestimonialService,
  LocalDataService
} from './shared/services';

import {
  HomePage,
  CpdPage,
  GarpRiskInstitutePage,
  TestimonialDetailPage
} from './pages';

import {
  AppComponent
} from './app.component';

const eagerLoadedPages: any[] = [
  AppComponent,
  HomePage,
  CpdPage,
  GarpRiskInstitutePage,
  TestimonialDetailPage
];

const core: any[] = [
  HeaderComponent,
  FooterComponent,
  HeaderNavigationModalComponent
];

import { environment } from '../environments/environment';
import { counterReducer } from './store/counter.reducer';

@NgModule({
  declarations: [
    ...eagerLoadedPages,
    ...core
  ],
  imports: [
    NgAisModule.forRoot(),
    BrowserModule.withServerTransition({ appId: "app" }),
    AppRoutingModule,
    StoreModule.forRoot({ count: counterReducer }),
    SharedModule,
    HttpClientModule,
    ServiceWorkerModule.register("ngsw-worker.js", { enabled: environment.production }),
    BrowserAnimationsModule,
    ServerTransferStateModule
  ],
  providers: [
    AppService,
    MetadataResolver,
  TestimonialService,
    LocalDataService,
    EventDetailsResolver,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true
    }
  ],
  entryComponents: [
    HeaderNavigationModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
