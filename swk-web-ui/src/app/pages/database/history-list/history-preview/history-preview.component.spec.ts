import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryPreviewComponent } from './history-preview.component';

describe('HistoryPreviewComponent', () => {
  let component: HistoryPreviewComponent;
  let fixture: ComponentFixture<HistoryPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
