import { Component, Input } from '@angular/core';

interface Recommendation {
  title: string;
  description: string;
  icon: string;
  link?: string;
}

@Component({
  selector: 'app-ai-recommendations',
  templateUrl: './ai-recommendations.component.html',
  styleUrls: ['./ai-recommendations.component.css']
})
export class AiRecommendationsComponent {
  @Input() recommendations: Recommendation[];
}
