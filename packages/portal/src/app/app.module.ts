import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    NgxMapLibreGLModule,
    NgSelectModule, 
    FormsModule,
    HttpClientModule,
    AutocompleteLibModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
