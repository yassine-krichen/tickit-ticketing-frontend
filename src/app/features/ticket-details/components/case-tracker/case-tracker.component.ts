import { Component, Input } from '@angular/core';

interface ProcessStep {
  name: string;
  status: 'completed' | 'error' | 'pending';
}

@Component({
  selector: 'app-case-tracker',
  templateUrl: './case-tracker.component.html',
  styleUrls: ['./case-tracker.component.css']
})
export class CaseTrackerComponent {
  @Input() steps: ProcessStep[];
}
