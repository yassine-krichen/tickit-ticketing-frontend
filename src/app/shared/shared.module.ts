import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileToUrlPipe } from './pipes/file-to-url.pipe';

@NgModule({
  declarations: [
    FileToUrlPipe
  ],
  imports: [CommonModule],
  exports: [
    CommonModule,
    FileToUrlPipe
  ]
})
export class SharedModule { }
