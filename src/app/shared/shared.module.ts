import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import shared components, directives, pipes here
@NgModule({
  declarations: [
    // shared components, directives, pipes
  ],
  imports: [CommonModule],
  exports: [
    // export shared components, directives, pipes
    CommonModule
  ]
})
export class SharedModule { }
