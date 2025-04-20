import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
@NgModule({
  declarations: [
    SidebarComponent,
    BackButtonComponent,
    ScrollToTopComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    SidebarComponent,
    BackButtonComponent,
    ScrollToTopComponent
  ],
  providers: [
    // Add your singleton services here
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
