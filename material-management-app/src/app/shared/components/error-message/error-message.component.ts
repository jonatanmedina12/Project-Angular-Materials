import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
  imports: [CommonModule, NzAlertModule, NzButtonModule]
})
export class ErrorMessageComponent  {

 title = input<string>('Error');
  message = input<string>('Ha ocurrido un error');
  closeable = input<boolean>(true);
  showRetry = input<boolean>(false);
  
  // Outputs usando la nueva API de signals
  retry = output<void>();
  close = output<void>();
  
  onRetry(): void {
    this.retry.emit();
  }

  onClose(): void {
    this.close.emit();
  }

}
