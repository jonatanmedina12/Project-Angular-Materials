import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  imports:[CommonModule,NzSpinModule],
  standalone: true
})
export class LoadingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
