import { Component, OnInit } from '@angular/core';
import { MaterialListComponent } from "../../components/material-list/material-list.component";
import { MaterialFiltersComponent } from "../../components/material-filters/material-filters.component";

@Component({
  selector: 'app-material-list-page',
  templateUrl: './material-list-page.component.html',
  styleUrls: ['./material-list-page.component.scss'],
  imports: [MaterialListComponent, MaterialFiltersComponent],
  standalone: true
})
export class MaterialListPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
