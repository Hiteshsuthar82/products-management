import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}
