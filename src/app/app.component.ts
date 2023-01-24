import { AfterViewInit, Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// export class AppComponent {
//   title = 'investment-project';
// }

export class AppComponent implements AfterViewInit {
  constructor(private elementRef: ElementRef) { }
  title = 'investment-project';
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#f2f2f2';
  }
}
