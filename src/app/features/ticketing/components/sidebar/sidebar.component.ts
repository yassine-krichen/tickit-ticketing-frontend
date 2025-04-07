import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  activeItem: string = 'dashboard';

  constructor(private translate: TranslateService) {
    // Set the default language
    translate.setDefaultLang('en');
    // Use default language
    translate.use('en');
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
  }

  setActiveItem(item: string): void {
    this.activeItem = item;
  }

  toggleTheme(): void {
    document.body.classList.toggle('dark-mode');
  }
}
