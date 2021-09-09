import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { ColorChromeModule } from 'ngx-color/chrome';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from './main/main.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ColorChromeModule, // added to imports
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
