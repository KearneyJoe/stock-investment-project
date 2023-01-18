import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockVizComponent } from './stock-viz.component';

describe('StockVizComponent', () => {
  let component: StockVizComponent;
  let fixture: ComponentFixture<StockVizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockVizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockVizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
