import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // Initialization logic if needed
  }

  onBackClick(): void {
    // Example: navigate back or use Angular's Router to go somewhere
  }
}
