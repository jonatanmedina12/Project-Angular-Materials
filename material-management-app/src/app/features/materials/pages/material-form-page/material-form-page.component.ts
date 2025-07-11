import { Component, OnInit } from '@angular/core';
import { MaterialFormComponent } from "../../components/material-form/material-form.component";

@Component({
  selector: 'app-material-form-page',
  templateUrl: './material-form-page.component.html',
  styleUrls: ['./material-form-page.component.scss'],
  imports: [MaterialFormComponent]
})
export class MaterialFormPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
