import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
 * Dashboard component that serves as the main landing page after login
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard | Tickit');
  }
}
