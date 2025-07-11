import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        
        <div class="actions">
          <button 
            class="btn btn-primary" 
            (click)="goHome()"
            type="button">
            Ir al inicio
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="goBack()"
            type="button">
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .not-found-content {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    h1 {
      font-size: 6rem;
      font-weight: bold;
      color: #667eea;
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 1.5rem;
      color: #333;
      margin: 1rem 0;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #dee2e6;
    }

    .btn-secondary:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }
  `]
})
export class NotFoundComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goHome(): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const homeRoute = isAuthenticated ? '/home' : '/auth/login';
    this.router.navigate([homeRoute]);
  }

  goBack(): void {
    window.history.back();
  }
}
