import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import {RouterModule, Routes} from '@angular/router';
import {GasComponent} from './gas/gas.component';
import {GasModule} from './gas/gas.module';

const routes: Routes = [
  {path: 'gas', component: GasComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    GasModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
